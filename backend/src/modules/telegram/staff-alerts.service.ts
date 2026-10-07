// backend/src/modules/telegram/staff-alerts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { formatMoney } from '../../common/utils/currency.util';
import { TelegramService } from './telegram.service';

const DAY_MS = 24 * 3600_000;

/**
 * Pings your staff Telegram group about things that should not wait until
 * someone opens the admin page. Every method is fire-and-forget safe: it never
 * throws, and does nothing when Telegram is not configured.
 *
 * Set TELEGRAM_ALERTS_CHAT_ID to send these to a different group than live chat.
 */
@Injectable()
export class StaffAlertsService {
  private readonly logger = new Logger(StaffAlertsService.name);
  private readonly lowBalanceSeen = new Map<string, number>(); // schoolId -> last alert time
  private readonly siteUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://elorgeschools.org').replace(/\/$/, '');

  constructor(private readonly prisma: PrismaService, private readonly telegram: TelegramService) {}

  private async send(text: string) {
    try {
      await this.telegram.notify(text, undefined, process.env.TELEGRAM_ALERTS_CHAT_ID || undefined);
    } catch (err) {
      this.logger.error(`staff alert failed: ${err}`);
    }
  }

  private e(s: unknown) { return this.telegram.esc(String(s ?? '')); }

  async newSchoolSignup(p: { schoolName: string; countryCode: string; adminName: string; adminEmail: string; phone?: string | null }) {
    await this.send(
      `🏫 <b>New school signup request</b>\n` +
      `<b>${this.e(p.schoolName)}</b> (${this.e(p.countryCode)})\n` +
      `👤 ${this.e(p.adminName)} · ${this.e(p.adminEmail)}${p.phone ? ` · ${this.e(p.phone)}` : ''}\n\n` +
      `Review and approve: ${this.siteUrl}/super-admin`,
    );
  }

  /** At most one alert per school per 24 h — a school below the threshold would otherwise ping on every debit. */
  async lowBalance(schoolId: string, balanceKobo: number) {
    try {
      const last = this.lowBalanceSeen.get(schoolId) ?? 0;
      if (Date.now() - last < DAY_MS) return;
      this.lowBalanceSeen.set(schoolId, Date.now());
      const school = await this.prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, currency: true } });
      if (!school) return;
      await this.send(`⚠️ <b>Low wallet balance</b>\n${this.e(school.name)} is down to <b>${this.e(formatMoney(balanceKobo, school.currency))}</b>.`);
    } catch (err) {
      this.logger.error(`low balance alert failed: ${err}`);
    }
  }

  async manualTransferClaim(schoolId: string, amountKobo: number, reference: string) {
    try {
      const school = await this.prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, currency: true } });
      await this.send(
        `🏦 <b>Bank transfer claim to review</b>\n${this.e(school?.name ?? schoolId)} says they paid ` +
        `<b>${this.e(formatMoney(amountKobo, school?.currency ?? 'NGN'))}</b>\nReference: ${this.e(reference)}\n\n${this.siteUrl}/finance`,
      );
    } catch (err) {
      this.logger.error(`transfer claim alert failed: ${err}`);
    }
  }

  async paymentFailed(p: { txRef?: string; schoolId?: unknown; amount?: unknown; currency?: string; reason?: string }) {
    try {
      const school = typeof p.schoolId === 'string'
        ? await this.prisma.school.findUnique({ where: { id: p.schoolId }, select: { name: true } })
        : null;
      await this.send(
        `❌ <b>Payment failed</b>\n${this.e(school?.name ?? 'Unknown school')} · ${this.e(p.amount)} ${this.e(p.currency)}\n` +
        `${p.reason ? `Reason: ${this.e(p.reason)}\n` : ''}Ref: ${this.e(p.txRef)}`,
      );
    } catch (err) {
      this.logger.error(`payment failed alert failed: ${err}`);
    }
  }

  /** Money arrived at Flutterwave but could NOT be credited to a wallet — needs a human. */
  async paymentProblem(summary: string, txRef?: string) {
    await this.send(`🚨 <b>Payment needs attention</b>\n${this.e(summary)}\nRef: ${this.e(txRef)}\nThe wallet was NOT credited.`);
  }
}
