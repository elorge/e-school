// web/app/page.tsx
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const FEATURES = [
  {
    title: 'Results that verify themselves',
    body: 'Every report card carries a QR stamp a parent can scan to confirm it\'s real — no more doubting a transcript.',
  },
  {
    title: 'ID cards & gate attendance',
    body: 'Issue a digital ID the day a student is registered. Scan it at the gate — even if the gate has no signal that morning.',
  },
  {
    title: 'A wallet, not an invoice pile',
    body: 'Fund once, spend as you generate result PINs. Bank transfer or card — your finance team approves transfers from one queue.',
  },
  {
    title: 'A calendar every teacher can print',
    body: 'Lay out a term in minutes, then hand every class teacher a printable copy — no more retyping the same dates by hand.',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-20 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Built for Nigerian schools</p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          A record your parents don't have to take your word for.
        </h1>
        <p className="max-w-xl text-lg text-ink/70">
          Results, ID cards, attendance, and school fees — in one place, working the way your school actually
          runs: sometimes with signal, sometimes without.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          <Link
            href="/signup"
            className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Get started
          </Link>
          <Link href="/login" className="rounded-full border border-black/10 px-6 py-3 font-medium text-ink transition hover:bg-black/5">
            Sign in
          </Link>
        </div>

        {/* Signature element: a mocked, verified report card */}
        <div className="relative mt-10 w-full max-w-md torn-edge">
          <div className="-rotate-2 rounded-t-xl border border-black/10 bg-white p-6 text-left shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-dashed border-black/10 pb-3">
              <span className="font-display text-sm font-semibold">Greenwood College</span>
              <span className="font-mono text-[10px] text-ink/50">2025/2026 — Term 2</span>
            </div>
            <p className="mb-1 font-mono text-xs text-ink/50">Admission ID</p>
            <p className="mb-4 font-mono text-sm">GRW/2025/0148</p>
            <div className="mb-4 flex flex-col gap-1.5 text-sm">
              {[
                ['Mathematics', 82, 'bg-brand-green'],
                ['English Language', 74, 'bg-brand-green'],
                ['Chemistry', 58, 'bg-amber'],
              ].map(([subject, score, color]) => (
                <div key={subject as string} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 text-ink/70">{subject}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                    <span className={`block h-full ${color}`} style={{ width: `${score}%` }} />
                  </span>
                  <span className="w-6 shrink-0 text-right font-mono text-xs">{score}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-brand-green/10 px-3 py-1.5 text-xs text-brand-green-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
              Verified — scan to confirm at elorgeschools.com/verify
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">
            Everything a registrar's office actually does, in one login.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="border-l-2 border-brand-blue/20 pl-5">
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-ink/60">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offline-first */}
      <section id="offline" className="px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-2xl bg-ink px-8 py-14 text-center text-white">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Offline-first</p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold">
            Register a student with no signal. It syncs the moment you're back.
          </h2>
          <p className="max-w-xl text-white/70">
            NEPA cuts the wifi mid-registration season. Your staff shouldn't have to stop working because of it —
            so they don't.
          </p>
        </div>
      </section>

      {/* Credibility — honest placeholder, not fabricated */}
      <section className="border-t border-black/5 px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-ink/50">
          Built for schools that take their records seriously — from single-campus academies to multi-branch
          colleges.
        </p>
      </section>

      {/* Final CTA */}
      <section className="border-t border-black/5 bg-white px-6 py-20 text-center">
        <h2 className="mb-6 font-display text-3xl font-semibold">Ready to see it running on your own data?</h2>
        
        <Link
          href="/signup"
          className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
        >
          Get started
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}