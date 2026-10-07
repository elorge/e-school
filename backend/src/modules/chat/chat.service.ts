// backend/src/modules/chat/chat.service.ts
import {
  BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit, ServiceUnavailableException,
} from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'crypto';
import { ChatConversation, ChatSender, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BrevoService } from '../email/brevo.service';
import { TelegramService } from '../telegram/telegram.service';
import { LeadsService } from '../leads/leads.service';
import { DigestService } from '../digest/digest.service';
import { StartChatDto } from './chat.dto';
import { agentReplyEmail, chatCopy } from './chat.copy';

const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);
const TAG_RE = /#([a-f0-9]{6})\b/i;

type AgentReplyOutcome = 'delivered' | 'emailed' | 'email_failed' | 'away_no_email_phone' | 'away_no_contact';
const OUTCOME_NOTE: Record<AgentReplyOutcome, string> = {
  delivered: '',
  emailed: ' (visitor is away — also emailed)',
  email_failed: ' (visitor is away — email failed, try their phone)',
  away_no_email_phone: ' (visitor is away, no email — try their phone)',
  away_no_contact: ' (visitor is away and left no contact details)',
};

/**
 * Website live chat. Visitors talk to the widget; your team answers from a
 * Telegram group by replying to the notification. A bot greets instantly,
 * nudges after CHAT_NUDGE_AFTER_SECONDS of silence and falls back to
 * email/phone after CHAT_FOLLOWUP_AFTER_SECONDS.
 */
@Injectable()
export class ChatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatService.name);
  private sweeper?: NodeJS.Timeout;

  private readonly nudgeMs = num(process.env.CHAT_NUDGE_AFTER_SECONDS, 90) * 1000;
  private readonly followUpMs = num(process.env.CHAT_FOLLOWUP_AFTER_SECONDS, 300) * 1000;
  private readonly awayMs = 60_000; // visitor not polling for this long = "away" -> email the agent's reply
  private readonly maxMessages = 300;
  private readonly siteUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://elorgeschools.org').replace(/\/$/, '');

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
    private readonly brevo: BrevoService,
    private readonly leads: LeadsService,
    private readonly digest: DigestService,
  ) {}

  onModuleInit() {
    this.telegram.onUpdate((u) => this.handleTelegramUpdate(u));
    // Catches waiting visitors even if their tab is closed. Claims are atomic, so
    // running on several instances (or alongside the poll endpoint) never double-sends.
    this.sweeper = setInterval(() => void this.sweep(), 30_000);
    this.sweeper.unref?.();
  }
  onModuleDestroy() { if (this.sweeper) clearInterval(this.sweeper); }

  // ───────────────────────── visitor side ─────────────────────────

  async start(dto: StartChatDto) {
    if (dto.website) return { token: randomBytes(24).toString('hex'), messages: [] }; // honeypot: pretend success
    if (!this.telegram.enabled) throw new ServiceUnavailableException({ code: 'chat_unavailable', message: 'Live chat is offline' });

    const email = (dto.email ?? '').toLowerCase();
    const phone = dto.phone ?? '';
    const countryCode = (dto.countryCode ?? '').toUpperCase();
    const conv = await this.createConversation({
      name: dto.name, email, phone, countryCode,
      locale: dto.locale ?? 'en', pageUrl: dto.pageUrl ?? null,
    });

    await this.addMessage(conv.id, 'VISITOR', dto.message);
    void this.leads.capture({
      kind: 'CHAT_STARTED', name: conv.name, email: email || null, phone: phone || null, countryCode: countryCode || null,
      chatId: conv.id, text: `Started a chat: "${dto.message.slice(0, 200)}"`,
    });
    const card = [
      `🆕 <b>New chat</b> #${conv.tag}`,
      `👤 ${this.telegram.esc(conv.name)}`,
      ...(email ? [`📧 ${this.telegram.esc(email)}`] : []),
      ...(phone ? [`📞 ${this.telegram.esc(phone)}`] : []),
      ...(countryCode ? [`🌍 ${this.countryName(countryCode)}`] : []),
      ...(!email && !phone ? ['⚠️ No email or phone left — only reachable in this chat'] : []),
      ...(conv.pageUrl ? [`📍 ${this.telegram.esc(conv.pageUrl)}`] : []),
    ];
    await this.telegram.notify(
      `${card.join('\n')}\n\n💬 ${this.telegram.esc(dto.message)}\n\n<i>Reply to this message to answer ${this.telegram.esc(conv.name)}.</i>`,
    );
    await this.addMessage(conv.id, 'BOT', chatCopy(conv.locale).welcome(this.firstName(conv.name)));

    return { token: conv.token, messages: await this.messagesAfter(conv.id, 0) };
  }

  async send(token: string, text: string) {
    const conv = await this.byToken(token);
    if ((await this.prisma.chatMessage.count({ where: { conversationId: conv.id } })) >= this.maxMessages) {
      throw new BadRequestException('This chat is full. Please email us instead.');
    }
    const msg = await this.addMessage(conv.id, 'VISITOR', text);
    // New wait period starts only if nobody is already waiting on an answer.
    if (!conv.waitingSince) {
      await this.prisma.chatConversation.update({
        where: { id: conv.id }, data: { waitingSince: new Date(), nudgeSentAt: null, followUpSentAt: null },
      });
    }
    await this.telegram.notify(`💬 <b>#${conv.tag}</b> ${this.telegram.esc(this.firstName(conv.name))}:\n${this.telegram.esc(text)}`);
    return this.pub(msg);
  }

  async poll(token: string, afterSeq: number) {
    const conv = await this.byToken(token);
    await this.prisma.chatConversation.update({ where: { id: conv.id }, data: { lastSeenAt: new Date() } });
    await this.escalateIfNeeded(conv);
    return { messages: await this.messagesAfter(conv.id, afterSeq) };
  }

  // ───────────────────────── automated follow-up ─────────────────────────

  private async escalateIfNeeded(conv: ChatConversation) {
    if (!conv.waitingSince) return;
    const waited = Date.now() - conv.waitingSince.getTime();
    if (!conv.nudgeSentAt && waited >= this.nudgeMs) await this.sendNudge(conv.id);
    if (!conv.followUpSentAt && waited >= this.followUpMs) await this.sendFollowUp(conv.id);
  }

  private async sweep() {
    if (!this.telegram.enabled) return;
    try {
      const now = Date.now();
      const due = await this.prisma.chatConversation.findMany({
        where: {
          waitingSince: { not: null, gt: new Date(now - 24 * 3600_000) },
          OR: [
            { nudgeSentAt: null, waitingSince: { lte: new Date(now - this.nudgeMs) } },
            { followUpSentAt: null, waitingSince: { lte: new Date(now - this.followUpMs) } },
          ],
        },
        take: 50,
      });
      for (const c of due) await this.escalateIfNeeded(c);
    } catch (err) { this.logger.error(`sweep failed: ${err}`); }
  }

  private async sendNudge(id: string) {
    const claim = await this.prisma.chatConversation.updateMany({
      where: { id, nudgeSentAt: null, waitingSince: { not: null } }, data: { nudgeSentAt: new Date() },
    });
    if (!claim.count) return;
    const c = await this.prisma.chatConversation.findUnique({ where: { id } });
    if (!c) return;
    await this.addMessage(id, 'BOT', chatCopy(c.locale).nudge(this.firstName(c.name)));
    await this.telegram.notify(`⏰ <b>#${c.tag}</b> (${this.telegram.esc(c.name)}) has been waiting ${Math.round(this.nudgeMs / 1000)}s — please reply.`);
  }

  private async sendFollowUp(id: string) {
    const claim = await this.prisma.chatConversation.updateMany({
      where: { id, followUpSentAt: null, waitingSince: { not: null } }, data: { followUpSentAt: new Date() },
    });
    if (!claim.count) return;
    const c = await this.prisma.chatConversation.findUnique({ where: { id } });
    if (!c) return;
    await this.addMessage(id, 'BOT', chatCopy(c.locale).followUp(this.firstName(c.name), c.email, c.phone));
    await this.telegram.notify(
      `🚨 <b>#${c.tag}</b> still unanswered after ${Math.round(this.followUpMs / 60000)} min.\n` +
      (c.email || c.phone
        ? `${this.telegram.esc(c.name)} · ${this.telegram.esc(c.email)} ${this.telegram.esc(c.phone)}\nThe visitor was told you will reply by email/phone.`
        : `${this.telegram.esc(c.name)} left no email or phone — the visitor was asked to keep the page open.`),
    );
  }

  // ───────────────────────── agent side (Telegram) ─────────────────────────

  verifyWebhookSecret(header: string | undefined): boolean {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!expected || !header) return false;
    const a = Buffer.from(header), b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async handleTelegramUpdate(update: any) {
    const m = update?.message;
    if (!m?.text || String(m.chat?.id) !== String(this.telegram.staffChatId)) return; // only your staff group
    const text: string = m.text.trim();

    if (/^\/(start|help)\b/.test(text)) {
      await this.telegram.notify('To answer a visitor, <b>long-press their message and tap Reply</b>.\n/waiting — chats still waiting for an answer\n/summary — the numbers for this week');
      return;
    }
    if (/^\/waiting\b/.test(text)) { await this.reportWaiting(); return; }
    if (/^\/summary\b/.test(text)) { await this.telegram.notify(await this.digest.build(), m.message_id); return; }
    if (text.startsWith('/')) return;

    const tag = TAG_RE.exec(m.reply_to_message?.text ?? '')?.[1]?.toLowerCase();
    if (!tag) { await this.telegram.notify('To answer a visitor, long-press their message and tap <b>Reply</b>.', m.message_id); return; }

    const conv = await this.prisma.chatConversation.findUnique({ where: { tag } });
    if (!conv) { await this.telegram.notify(`Chat #${tag} was not found.`, m.message_id); return; }

    // Telegram retries webhooks — never post the same reply twice.
    if (await this.prisma.chatMessage.findUnique({ where: { tgReplyId: m.message_id } })) return;

    const agentName: string = String(m.from?.first_name ?? 'Elorge team').slice(0, 40);
    let outcome: AgentReplyOutcome;
    try {
      outcome = await this.deliverAgentReply(conv, text, agentName, m.message_id);
    } catch (e) {
      if ((e as Prisma.PrismaClientKnownRequestError).code === 'P2002') return; // lost a race with a retry
      throw e;
    }
    await this.telegram.notify(`✅ Delivered to #${tag}${OUTCOME_NOTE[outcome]}`, m.message_id);
  }

  /** Answer from the platform admin page instead of Telegram. Same effects as a Telegram reply. */
  async replyFromAdmin(conversationId: string, text: string, userId: string) {
    const conv = await this.prisma.chatConversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Chat not found');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    const agentName = (user?.fullName ?? 'Elorge team').trim().split(/\s+/)[0].slice(0, 40) || 'Elorge team';
    const outcome = await this.deliverAgentReply(conv, text, agentName);
    // Tell the team in Telegram so nobody answers the same visitor twice.
    await this.telegram.notify(
      `💬 <b>#${conv.tag}</b> answered from the admin page by ${this.telegram.esc(agentName)}:\n${this.telegram.esc(text)}${OUTCOME_NOTE[outcome]}`,
    );
    return { ok: true, outcome };
  }

  /** Saves an agent's answer, ends the visitor's waiting state, and emails them if they have left the page. */
  private async deliverAgentReply(conv: ChatConversation, text: string, agentName: string, tgReplyId?: number): Promise<AgentReplyOutcome> {
    await this.prisma.chatMessage.create({
      data: { conversationId: conv.id, sender: 'AGENT', text: text.slice(0, 1000), agentName, ...(tgReplyId ? { tgReplyId } : {}) },
    });
    await this.prisma.chatConversation.update({
      where: { id: conv.id },
      data: { waitingSince: null, nudgeSentAt: null, followUpSentAt: null, lastAgentAt: new Date() },
    });

    if (Date.now() - conv.lastSeenAt.getTime() <= this.awayMs) return 'delivered';
    if (!conv.email) return conv.phone ? 'away_no_email_phone' : 'away_no_contact';
    const { subject, html } = agentReplyEmail({ locale: conv.locale, name: this.firstName(conv.name), agent: agentName, text, siteUrl: this.siteUrl });
    const sent = await this.brevo.send({ to: [{ email: conv.email, name: conv.name }], subject, htmlContent: html, tags: ['chat-reply'] });
    return sent ? 'emailed' : 'email_failed';
  }

  private async reportWaiting() {
    const list = await this.prisma.chatConversation.findMany({
      where: { waitingSince: { not: null } }, orderBy: { waitingSince: 'asc' }, take: 15,
    });
    if (!list.length) { await this.telegram.notify('🎉 No chats waiting.'); return; }
    const lines = list.map((c) => `• <b>#${c.tag}</b> ${this.telegram.esc(c.name)} — ${Math.round((Date.now() - c.waitingSince!.getTime()) / 60000)} min`);
    await this.telegram.notify(`<b>Waiting for an answer</b>\n${lines.join('\n')}`);
  }

  // ───────────────────────── helpers ─────────────────────────

  private async createConversation(data: Omit<Prisma.ChatConversationUncheckedCreateInput, 'token' | 'tag' | 'waitingSince'>) {
    for (let i = 0; i < 5; i++) {
      try {
        return await this.prisma.chatConversation.create({
          data: { ...data, token: randomBytes(24).toString('hex'), tag: randomBytes(3).toString('hex'), waitingSince: new Date() },
        });
      } catch (e) {
        if ((e as Prisma.PrismaClientKnownRequestError).code !== 'P2002') throw e; // tag collision — retry
      }
    }
    throw new ServiceUnavailableException('Could not start chat');
  }

  private async byToken(token: string | undefined) {
    if (!token || !/^[a-f0-9]{48}$/.test(token)) throw new NotFoundException('Chat not found');
    const conv = await this.prisma.chatConversation.findUnique({ where: { token } });
    if (!conv) throw new NotFoundException('Chat not found');
    return conv;
  }

  private addMessage(conversationId: string, sender: ChatSender, text: string) {
    return this.prisma.chatMessage.create({ data: { conversationId, sender, text: text.slice(0, 1500) } });
  }

  private async messagesAfter(conversationId: string, afterSeq: number) {
    const rows = await this.prisma.chatMessage.findMany({
      where: { conversationId, seq: { gt: afterSeq } }, orderBy: { seq: 'asc' }, take: 100,
    });
    return rows.map((r) => this.pub(r));
  }

  private pub(m: { id: string; seq: number; sender: ChatSender; text: string; agentName: string | null; createdAt: Date }) {
    return { id: m.id, seq: m.seq, sender: m.sender, text: m.text, agentName: m.agentName, createdAt: m.createdAt };
  }

  private firstName(full: string) { return full.trim().split(/\s+/)[0] || full; }

  private countryName(code: string) {
    if (code === 'ZZ') return 'Other / not listed';
    try { return this.telegram.esc(new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code); } catch { return code; }
  }
}
