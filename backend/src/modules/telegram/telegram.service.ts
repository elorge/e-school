// backend/src/modules/chat/telegram.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

type UpdateHandler = (update: any) => Promise<void>;

/**
 * Thin wrapper over the Telegram Bot API. Never throws — a Telegram outage
 * must not break the website chat, it just means agents are not pinged.
 */
@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private handler?: UpdateHandler;
  private pollTimer?: NodeJS.Timeout;
  private pollOffset = 0;
  private polling = false;

  private get token() { return process.env.TELEGRAM_BOT_TOKEN; }
  get staffChatId() { return process.env.TELEGRAM_CHAT_ID; }
  get enabled() { return !!this.token && !!this.staffChatId; }

  onUpdate(handler: UpdateHandler) { this.handler = handler; }

  /** LOCAL TESTING ONLY: TELEGRAM_POLL=true pulls replies with getUpdates instead of a webhook. */
  onModuleInit() {
    if (!this.enabled || process.env.TELEGRAM_POLL !== 'true') return;
    this.logger.warn('TELEGRAM_POLL=true — polling Telegram for replies (local testing only; do not use with a webhook).');
    void this.call('deleteWebhook', {});
    this.pollTimer = setInterval(() => void this.pull(), 2000);
    this.pollTimer.unref?.();
  }

  onModuleDestroy() { if (this.pollTimer) clearInterval(this.pollTimer); }

  private async pull() {
    if (this.polling) return;
    this.polling = true;
    try {
      const r = await this.call('getUpdates', { offset: this.pollOffset, timeout: 0 });
      for (const u of r?.result ?? []) {
        this.pollOffset = Math.max(this.pollOffset, u.update_id + 1);
        await this.handler?.(u).catch((e) => this.logger.error(`handler failed: ${e}`));
      }
    } finally { this.polling = false; }
  }

  async call(method: string, body: Record<string, unknown>): Promise<any | null> {
    if (!this.token) return null;
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      });
      const json: any = await res.json().catch(() => null);
      if (!json?.ok) this.logger.error(`Telegram ${method} failed: ${JSON.stringify(json)}`);
      return json;
    } catch (err) {
      this.logger.error(`Telegram ${method} error: ${err}`);
      return null;
    }
  }

  /** Posts to the staff group (or `chatId` if given). `text` is HTML — escape anything user-supplied with esc(). */
  async notify(text: string, replyToMessageId?: number, chatId?: string): Promise<number | null> {
    if (!this.enabled) return null;
    const r = await this.call('sendMessage', {
      chat_id: chatId ?? this.staffChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(replyToMessageId ? { reply_to_message_id: replyToMessageId, allow_sending_without_reply: true } : {}),
    });
    return r?.result?.message_id ?? null;
  }

  esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}
