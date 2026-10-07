// web/lib/endpoints/platform-analytics.ts
import { apiFetch } from '../api';

export interface AnalyticsSummary {
  days: number;
  totals: { visitors: number; pageViews: number; chats: number; signups: number; demos: number };
  funnel: { visited: number; pricing: number; signupPage: number; signedUp: number; chatted: number };
  topPages: { path: string; views: number; visitors: number }[];
  sources: { source: string; visitors: number; leads: number }[];
  daily: { day: string; visitors: number }[];
}

export function getPlatformAnalytics(days: 7 | 30 | 90): Promise<AnalyticsSummary> {
  return apiFetch(`/platform/analytics?days=${days}`);
}
