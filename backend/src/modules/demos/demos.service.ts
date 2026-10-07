// backend/src/modules/demos/demos.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { BrevoService } from '../email/brevo.service';
import { LeadsService } from '../leads/leads.service';
import { TelegramService } from '../telegram/telegram.service';
import { RequestDemoDto } from './demos.dto';
import { demoConfirmationEmail } from './demos.copy';

const TIME_LABEL: Record<string, string> = { morning: 'morning', afternoon: 'afternoon', evening: 'evening' };

@Injectable()
export class DemosService {
  private readonly logger = new Logger(DemosService.name);
  private readonly siteUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://elorgeschools.org').replace(/\/$/, '');

  constructor(
    private readonly leads: LeadsService,
    private readonly telegram: TelegramService,
    private readonly brevo: BrevoService,
  ) {}

  async request(dto: RequestDemoDto) {
    if (dto.website) return { ok: true }; // honeypot: pretend success

    const countryCode = dto.countryCode.toUpperCase();
    const country = this.countryName(countryCode);
    const when = [
      dto.preferredDate ?? 'any day',
      dto.timeOfDay ? TIME_LABEL[dto.timeOfDay] : null,
      dto.timezone ? `(${dto.timezone})` : null,
    ].filter(Boolean).join(' ');
    const details = [
      `Preferred time: ${when}`,
      dto.studentCount ? `Students: ${dto.studentCount}` : null,
      dto.message ? `Message: ${dto.message}` : null,
    ].filter((x): x is string => !!x);

    // The lead is the system of record — saved first, so a Telegram or email hiccup can't lose a request.
    await this.leads.capture({
      kind: 'DEMO_REQUESTED', name: dto.name, email: dto.email, phone: dto.phone, countryCode,
      schoolName: dto.schoolName, text: `Demo requested for ${dto.schoolName}. ${details.join(' · ')}`,
    });

    const e = (s: string) => this.telegram.esc(s);
    await this.telegram.notify(
      `📅 <b>Demo request</b>\n` +
      `🏫 <b>${e(dto.schoolName)}</b> · ${e(country)}\n👤 ${e(dto.name)} · ${e(dto.email)}${dto.phone ? ` · ${e(dto.phone)}` : ''}\n` +
      `${details.map((d) => e(d)).join('\n')}\n\nFollow up: ${this.siteUrl}/super-admin/leads`,
    );

    const { subject, html } = demoConfirmationEmail({
      locale: dto.locale, name: dto.name.split(/\s+/)[0],
      lines: [`School: ${dto.schoolName}`, `Country: ${country}`, ...details],
    });
    const sent = await this.brevo.send({ to: [{ email: dto.email, name: dto.name }], subject, htmlContent: html, tags: ['demo-request'] });
    if (!sent) this.logger.warn(`demo confirmation email to ${dto.email} was not sent`);

    return { ok: true };
  }

  private countryName(code: string) {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code; } catch { return code; }
  }
}
