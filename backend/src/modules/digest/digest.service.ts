// backend/src/modules/digest/digest.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { formatMoney } from '../../common/utils/currency.util';
import { LOW_BALANCE_WARNING_THRESHOLD_KOBO } from '../../common/constants';

const DAY_MS = 24 * 3600_000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);

/**
 * Posts a weekly summary to Telegram every Monday morning (DIGEST_TIMEZONE, DIGEST_HOUR).
 * No cron dependency: a light timer checks every 10 minutes and claims the week in the
 * database, so it also catches up if the server was asleep at 8 am, and two instances
 * can never both send. Staff can also type /summary in the group at any time.
 */
@Injectable()
export class DigestService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DigestService.name);
  private timer?: NodeJS.Timeout;
  private readonly hour = num(process.env.DIGEST_HOUR, 8);
  private readonly tz = this.validTimezone(process.env.DIGEST_TIMEZONE ?? 'Africa/Lagos');
  private readonly siteUrl = (process.env.FRONTEND_PUBLIC_URL ?? 'https://elorgeschools.org').replace(/\/$/, '');

  constructor(private readonly prisma: PrismaService, private readonly telegram: TelegramService) {}

  onModuleInit() {
    if (!this.telegram.enabled || process.env.DIGEST_ENABLED === 'false') return;
    const first = setTimeout(() => void this.tick(), 45_000); // soon after boot, for catch-up
    first.unref?.();
    this.timer = setInterval(() => void this.tick(), 10 * 60_000);
    this.timer.unref?.();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  private validTimezone(tz: string) {
    try { new Intl.DateTimeFormat('en', { timeZone: tz }); return tz; } catch { return 'UTC'; }
  }

  private localParts(d: Date) {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: this.tz, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
    const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
    return { weekday: WEEKDAYS.indexOf(p.weekday), y: Number(p.year), m: Number(p.month), d: Number(p.day), hour: Number(p.hour) };
  }

  /** Sends this week's summary if it is Monday after DIGEST_HOUR (or any later day) and it has not gone out yet. */
  async tick(now = new Date()) {
    try {
      const lp = this.localParts(now);
      if (lp.weekday === 0 && lp.hour < this.hour) return; // Monday, too early
      const monday = new Date(Date.UTC(lp.y, lp.m - 1, lp.d) - lp.weekday * DAY_MS).toISOString().slice(0, 10);

      try {
        await this.prisma.digestRun.create({ data: { weekOf: monday } }); // atomic claim
      } catch (e) {
        if ((e as Prisma.PrismaClientKnownRequestError).code === 'P2002') return; // already sent
        throw e;
      }
      const id = await this.telegram.notify(await this.build(now), undefined, process.env.TELEGRAM_ALERTS_CHAT_ID || undefined);
      if (!id) await this.prisma.digestRun.delete({ where: { weekOf: monday } }).catch(() => undefined); // retry next tick
    } catch (err) {
      this.logger.error(`digest tick failed: ${err}`);
    }
  }

  /** The summary text for the 7 days ending `now`. Also used by the /summary command. */
  async build(now = new Date()): Promise<string> {
    const since = new Date(now.getTime() - 7 * DAY_MS);
    const prevSince = new Date(since.getTime() - 7 * DAY_MS);
    const e = (s: string) => this.telegram.esc(s);

    const [web, prevWeb, topSource, activity, newLeads, demosBooked, newSchools, activeSchools, pendingSignups, topUps, pendingTransfers, ledger] =
      await Promise.all([
        this.prisma.$queryRaw<{ visitors: number; pageViews: number }[]>`
          SELECT COUNT(DISTINCT "sessionId")::int AS visitors, (COUNT(*) FILTER (WHERE name = 'page_view'))::int AS "pageViews"
          FROM analytics_events WHERE "createdAt" >= ${since}`,
        this.prisma.$queryRaw<{ visitors: number }[]>`
          SELECT COUNT(DISTINCT "sessionId")::int AS visitors FROM analytics_events
          WHERE "createdAt" >= ${prevSince} AND "createdAt" < ${since}`,
        this.prisma.$queryRaw<{ source: string; visitors: number }[]>`
          SELECT COALESCE(NULLIF("utmSource", ''), NULLIF(referrer, ''), 'direct') AS source, COUNT(DISTINCT "sessionId")::int AS visitors
          FROM analytics_events WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY visitors DESC LIMIT 1`,
        this.prisma.leadActivity.groupBy({
          by: ['kind'], _count: { _all: true },
          where: { createdAt: { gte: since }, kind: { in: ['CHAT_STARTED', 'DEMO_REQUESTED', 'SIGNUP_REQUESTED'] } },
        }),
        this.prisma.lead.count({ where: { status: 'NEW' } }),
        this.prisma.lead.count({ where: { status: 'DEMO_BOOKED' } }),
        this.prisma.school.count({ where: { createdAt: { gte: since } } }),
        this.prisma.school.count({ where: { status: 'ACTIVE' } }),
        this.prisma.schoolSignupRequest.count({ where: { status: 'PENDING' } }),
        this.prisma.walletLedgerEntry.groupBy({
          by: ['currency'], _sum: { amountKobo: true }, _count: { _all: true },
          where: { type: 'CREDIT', status: 'CONFIRMED', source: { in: ['GATEWAY', 'MANUAL_TRANSFER', 'DVA'] }, createdAt: { gte: since } },
        }),
        this.prisma.walletLedgerEntry.count({ where: { source: 'MANUAL_TRANSFER', status: 'PENDING' } }),
        this.prisma.walletLedgerEntry.groupBy({ by: ['schoolId', 'type'], where: { status: 'CONFIRMED' }, _sum: { amountKobo: true } }),
      ]);

    const count = (k: string) => activity.find((a) => a.kind === k)?._count._all ?? 0;
    const visitors = web[0]?.visitors ?? 0;
    const prev = prevWeb[0]?.visitors ?? 0;
    const trend = prev > 0 ? ` (${visitors >= prev ? '▲' : '▼'} ${Math.round((Math.abs(visitors - prev) / prev) * 100)}% vs last week)` : '';

    // Schools running low: balance = confirmed credits − confirmed debits, per school.
    const balances = new Map<string, number>();
    for (const r of ledger) {
      balances.set(r.schoolId, (balances.get(r.schoolId) ?? 0) + (r.type === 'CREDIT' ? 1 : -1) * (r._sum.amountKobo ?? 0));
    }
    const lowIds = [...balances].filter(([, b]) => b < LOW_BALANCE_WARNING_THRESHOLD_KOBO).map(([id]) => id);
    const lowSchools = lowIds.length
      ? await this.prisma.school.findMany({ where: { id: { in: lowIds }, status: 'ACTIVE' }, select: { id: true, name: true, currency: true }, take: 5 })
      : [];

    const fmt = (d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: this.tz, day: 'numeric', month: 'short' }).format(d);
    const lines: string[] = [
      `📊 <b>Elorge weekly summary</b>`,
      `<i>${fmt(since)} – ${fmt(now)}</i>`,
      ``,
      `🌍 <b>Website</b>`,
      `Visitors: <b>${visitors}</b>${trend} · Page views: ${web[0]?.pageViews ?? 0}`,
      ...(topSource[0] ? [`Top source: ${e(topSource[0].source)} (${topSource[0].visitors})`] : []),
      ``,
      `🎯 <b>Leads</b>`,
      `Chats: ${count('CHAT_STARTED')} · Demo requests: ${count('DEMO_REQUESTED')} · Signup requests: ${count('SIGNUP_REQUESTED')}`,
      `Waiting for first contact: <b>${newLeads}</b> · Demos booked: ${demosBooked}`,
      ``,
      `🏫 <b>Schools</b>`,
      `New this week: ${newSchools} · Active: ${activeSchools} · Signups awaiting approval: <b>${pendingSignups}</b>`,
      ``,
      `💰 <b>Money in</b>`,
      ...(topUps.length
        ? topUps.map((t) => `${e(formatMoney(t._sum.amountKobo ?? 0, t.currency))} (${t._count._all} top-up${t._count._all === 1 ? '' : 's'})`)
        : ['No top-ups this week']),
      ...(pendingTransfers ? [`🏦 Bank-transfer claims to review: <b>${pendingTransfers}</b>`] : []),
    ];
    if (lowSchools.length) {
      lines.push('', `⚠️ <b>Running low on credit</b>`);
      for (const s of lowSchools) lines.push(`${e(s.name)} — ${e(formatMoney(balances.get(s.id) ?? 0, s.currency))}`);
    }
    if (newLeads || pendingSignups) lines.push('', `Follow up: ${this.siteUrl}/super-admin/leads`);
    return lines.join('\n');
  }
}
