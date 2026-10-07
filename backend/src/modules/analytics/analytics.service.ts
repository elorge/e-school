// backend/src/modules/analytics/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrackEventDto } from './analytics.dto';

const BOT_RE = /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|lighthouse|monitor|uptime/i;

export interface AnalyticsSummary {
  days: number;
  totals: { visitors: number; pageViews: number; chats: number; signups: number; demos: number };
  funnel: { visited: number; pricing: number; signupPage: number; signedUp: number; chatted: number };
  topPages: { path: string; views: number; visitors: number }[];
  sources: { source: string; visitors: number; leads: number }[];
  daily: { day: string; visitors: number }[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Never throws — analytics must not be able to break a page. */
  async track(dto: TrackEventDto, userAgent: string | undefined) {
    if (!userAgent || BOT_RE.test(userAgent)) return; // crawlers and uptime monitors are not visitors
    try {
      const path = dto.path.split(/[?#]/)[0] || '/';
      await this.prisma.analyticsEvent.create({
        data: {
          name: dto.name,
          path,
          sessionId: dto.sessionId,
          referrer: dto.referrer || null,
          utmSource: dto.utmSource || null,
          utmMedium: dto.utmMedium || null,
          utmCampaign: dto.utmCampaign || null,
          locale: dto.locale ?? null,
          device: dto.device ?? null,
        },
      });
    } catch (err) {
      this.logger.error(`track failed: ${err}`);
    }
  }

  async summary(daysInput: number): Promise<AnalyticsSummary> {
    const days = [7, 30, 90].includes(daysInput) ? daysInput : 30;
    const since = new Date(Date.now() - days * 24 * 3600_000);

    // COUNT(...) is bigint in Postgres, which Prisma returns as BigInt — cast to int so it serialises as a number.
    const [totals] = await this.prisma.$queryRaw<
      { visitors: number; pageViews: number; chats: number; signups: number; demos: number; pricing: number; signupPage: number }[]
    >`
      SELECT
        COUNT(DISTINCT "sessionId")::int AS visitors,
        (COUNT(*) FILTER (WHERE name = 'page_view'))::int AS "pageViews",
        (COUNT(DISTINCT "sessionId") FILTER (WHERE name = 'chat_started'))::int AS chats,
        (COUNT(DISTINCT "sessionId") FILTER (WHERE name = 'signup_submitted'))::int AS signups,
        (COUNT(DISTINCT "sessionId") FILTER (WHERE name = 'demo_requested'))::int AS demos,
        (COUNT(DISTINCT "sessionId") FILTER (WHERE name = 'page_view' AND path = '/pricing'))::int AS pricing,
        (COUNT(DISTINCT "sessionId") FILTER (WHERE name = 'page_view' AND path = '/signup'))::int AS "signupPage"
      FROM analytics_events
      WHERE "createdAt" >= ${since}`;

    const topPages = await this.prisma.$queryRaw<{ path: string; views: number; visitors: number }[]>`
      SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT "sessionId")::int AS visitors
      FROM analytics_events
      WHERE name = 'page_view' AND "createdAt" >= ${since}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10`;

    // Every event carries the session's landing source, so grouping by it is stable per session.
    const sources = await this.prisma.$queryRaw<{ source: string; visitors: number; leads: number }[]>`
      SELECT
        COALESCE(NULLIF("utmSource", ''), NULLIF(referrer, ''), 'direct') AS source,
        COUNT(DISTINCT "sessionId")::int AS visitors,
        (COUNT(DISTINCT "sessionId") FILTER (WHERE name IN ('chat_started', 'signup_submitted')))::int AS leads
      FROM analytics_events
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY visitors DESC
      LIMIT 10`;

    const dailyRows = await this.prisma.$queryRaw<{ day: string; visitors: number }[]>`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, COUNT(DISTINCT "sessionId")::int AS visitors
      FROM analytics_events
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1`;

    // Fill days with no traffic so the chart has no gaps.
    const byDay = new Map<string, number>(dailyRows.map((r): [string, number] => [r.day, r.visitors]));
    const daily: { day: string; visitors: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 3600_000).toISOString().slice(0, 10);
      daily.push({ day, visitors: byDay.get(day) ?? 0 });
    }

    const t = totals ?? { visitors: 0, pageViews: 0, chats: 0, signups: 0, demos: 0, pricing: 0, signupPage: 0 };
    return {
      days,
      totals: { visitors: t.visitors, pageViews: t.pageViews, chats: t.chats, signups: t.signups, demos: t.demos },
      funnel: { visited: t.visitors, pricing: t.pricing, signupPage: t.signupPage, signedUp: t.signups, chatted: t.chats },
      topPages,
      sources,
      daily,
    };
  }
}
