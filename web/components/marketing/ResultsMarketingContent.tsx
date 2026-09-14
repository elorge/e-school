// web/components/marketing/ResultsMarketingContent.tsx
'use client';

import Link from 'next/link';
import { QrCode, ShieldCheck, Search, Smartphone } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { resultsMarketingLabelsFor } from '@/lib/i18n/results-marketing-labels';

const ICONS = [Search, ShieldCheck, QrCode];

export default function ResultsMarketingContent() {
  const { locale } = useMarketingLocale();
  const t = resultsMarketingLabelsFor(locale);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.kicker}</p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t.heroTitle}</h1>
        <p className="max-w-xl text-lg text-ink/70">{t.heroBody}</p>
      </section>

      {/* Important clarifying note */}
      <section className="px-6 pb-16">
        <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl border border-amber/30 bg-amber/10 p-5 text-left">
          <Smartphone className="mt-0.5 shrink-0 text-amber" size={20} />
          <p className="text-sm text-ink/70">{t.noteBody}</p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.howItWorksHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.howItWorks.map(({ title, body }, i) => {
              const Icon = ICONS[i];
              return (
                <div key={title} className="pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">
                    {i + 1}. {title}
                  </h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center font-display text-3xl font-semibold text-ink">{t.faqHeading}</h2>
          <div className="flex flex-col gap-8">
            {t.faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-2 font-display text-lg font-semibold text-ink">{faq.q}</h3>
                <p className="text-sm text-ink/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/5 bg-white px-6 py-20 text-center">
        <h2 className="mb-4 font-display text-3xl font-semibold">{t.ctaHeading}</h2>
        <p className="mx-auto mb-6 max-w-md text-ink/60">{t.ctaBody}</p>
        <Link
          href="/signup"
          className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
        >
          {t.ctaButton}
        </Link>
      </section>
    </main>
  );
}
