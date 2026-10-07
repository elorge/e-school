// web/app/super-admin/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PlatformNav from '@/components/PlatformNav';
import LoadingScreen from '@/components/LoadingScreen';
import { getSessionUser } from '@/lib/session';
import { getPlatformAnalytics, type AnalyticsSummary } from '@/lib/endpoints/platform-analytics';
import { BarChart3 } from 'lucide-react';

const RANGES = [7, 30, 90] as const;
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value.toLocaleString()}</p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

export default function PlatformAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'SUPER_ADMIN') window.location.href = '/login';
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPlatformAnalytics(days)
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch(() => { if (!cancelled) setError('Failed to load analytics'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  if (isLoading) return <LoadingScreen />;

  const f = data?.funnel;
  const steps = f
    ? [
        { label: 'Visited the site', n: f.visited },
        { label: 'Viewed pricing', n: f.pricing },
        { label: 'Opened the signup page', n: f.signupPage },
        { label: 'Submitted a signup request', n: f.signedUp },
      ]
    : [];
  const maxDaily = Math.max(1, ...(data?.daily.map((d) => d.visitors) ?? [1]));

  return (
    <>
      <PlatformNav title="Elorge — Website Analytics" />
      <div className="mx-auto max-w-6xl px-6 pt-4">
        <Link href="/super-admin" className="text-sm text-brand-blue underline">← Back to super admin</Link>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold"><BarChart3 size={20} /> Website analytics</h1>
          <div className="flex rounded-full border border-black/10 bg-white p-0.5 text-sm">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-full px-4 py-1.5 transition ${days === r ? 'bg-brand-blue text-white' : 'text-ink/60 hover:text-ink'}`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Visitors" value={data.totals.visitors} hint="Unique browser sessions" />
              <Stat label="Page views" value={data.totals.pageViews} />
              <Stat label="Chats started" value={data.totals.chats} hint={`${pct(data.totals.chats, data.totals.visitors)}% of visitors`} />
              <Stat label="Demo requests" value={data.totals.demos} hint={`${pct(data.totals.demos, data.totals.visitors)}% of visitors`} />
              <Stat label="Signup requests" value={data.totals.signups} hint={`${pct(data.totals.signups, data.totals.visitors)}% of visitors`} />
            </div>

            {/* Funnel */}
            <section className="card mt-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Signup funnel</h2>
              <div className="flex flex-col gap-3">
                {steps.map((s, i) => (
                  <div key={s.label}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span>{s.label}</span>
                      <span className="text-ink/60">
                        <b className="text-ink">{s.n.toLocaleString()}</b> · {pct(s.n, steps[0].n)}%
                        {i > 0 && steps[i - 1].n > 0 && <span className="text-ink/40"> ({pct(s.n, steps[i - 1].n)}% of previous step)</span>}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
                      <div className="h-full rounded-full bg-brand-blue" style={{ width: `${pct(s.n, steps[0].n)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink/50">
                Funnel steps count visitors who reached that page or action at any point in their visit, not strictly in order.
              </p>
            </section>

            {/* Daily visitors */}
            <section className="card mt-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Visitors per day</h2>
              <div className="flex h-36 items-end gap-[3px]">
                {data.daily.map((d) => (
                  <div key={d.day} className="group relative flex h-full flex-1 items-end" title={`${d.day}: ${d.visitors}`}>
                    <div className="w-full rounded-t bg-brand-blue/70 transition group-hover:bg-brand-blue" style={{ height: `${Math.max(2, (d.visitors / maxDaily) * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink/40">
                <span>{data.daily[0]?.day}</span>
                <span>{data.daily[data.daily.length - 1]?.day}</span>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Sources */}
              <section className="card">
                <h2 className="mb-3 font-display text-lg font-semibold">Where visitors come from</h2>
                {data.sources.length === 0 ? <p className="text-sm text-ink/40">No data yet.</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-ink/50"><th className="pb-2 font-medium">Source</th><th className="pb-2 text-right font-medium">Visitors</th><th className="pb-2 text-right font-medium">Leads</th></tr></thead>
                    <tbody>
                      {data.sources.map((s) => (
                        <tr key={s.source} className="border-t border-black/5">
                          <td className="py-2">{s.source}</td>
                          <td className="py-2 text-right">{s.visitors}</td>
                          <td className="py-2 text-right">{s.leads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <p className="mt-3 text-xs text-ink/50">Leads = visitors who started a chat or requested a signup. Tag campaign links with <code>?utm_source=…</code> to see them here.</p>
              </section>

              {/* Top pages */}
              <section className="card">
                <h2 className="mb-3 font-display text-lg font-semibold">Top pages</h2>
                {data.topPages.length === 0 ? <p className="text-sm text-ink/40">No data yet.</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-ink/50"><th className="pb-2 font-medium">Page</th><th className="pb-2 text-right font-medium">Views</th><th className="pb-2 text-right font-medium">Visitors</th></tr></thead>
                    <tbody>
                      {data.topPages.map((p) => (
                        <tr key={p.path} className="border-t border-black/5">
                          <td className="py-2 font-mono text-xs">{p.path}</td>
                          <td className="py-2 text-right">{p.views}</td>
                          <td className="py-2 text-right">{p.visitors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>
            <p className="mt-6 text-xs text-ink/40">Anonymous and cookie-free: no IP addresses are stored, bots are ignored, and browsers that send Do Not Track are not counted.</p>
          </>
        )}
      </main>
    </>
  );
}
