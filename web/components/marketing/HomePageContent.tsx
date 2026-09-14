// web/components/marketing/HomePageContent.tsx
'use client';

import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SUPPORTED_COUNTRIES } from '@/lib/currency';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { homeLabelsFor } from '@/lib/i18n/home-labels';
import { CreditCard, ScanLine, Monitor, Wifi, NotebookPen, Presentation, Pencil, Wallet, Boxes, Calculator, Globe2 } from 'lucide-react';

const LESSON_NOTE_ICONS = [NotebookPen, Presentation, Pencil];
const FINANCE_ICONS = [Wallet, Boxes, Calculator];
const INFRASTRUCTURE_ICONS = [CreditCard, ScanLine, Monitor, Wifi];

export default function HomePageContent() {
  const { locale } = useMarketingLocale();
  const t = homeLabelsFor(locale);

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-20 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.kicker}</p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t.heroTitle}</h1>
        <p className="max-w-xl text-lg text-ink/70">{t.heroSubtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:bg-brand-blue-dark">
            {t.getStarted}
          </Link>
          <Link href="/login" className="rounded-full border border-black/10 px-6 py-3 font-medium text-ink transition hover:bg-black/5">
            {t.signIn}
          </Link>
        </div>

        {/* Signature element: a mocked, verified report card */}
        <div className="relative mt-10 w-full max-w-md torn-edge">
          <div className="-rotate-2 rounded-t-xl border border-black/10 bg-white p-6 text-left shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-dashed border-black/10 pb-3">
              <span className="font-display text-sm font-semibold">{t.mockSchoolName}</span>
              <span className="font-mono text-[10px] text-ink/50">{t.mockTermLabel}</span>
            </div>
            <p className="mb-1 font-mono text-xs text-ink/50">{t.admissionIdLabel}</p>
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
              {t.verifiedLabel}
            </div>
          </div>
        </div>
      </section>

      {/* Core features */}
      <section id="features" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.coreFeaturesHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {t.coreFeatures.map((feature) => (
              <div key={feature.title} className="border-l-2 border-brand-blue/20 pl-5">
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-ink/60">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global reach */}
      <section id="global" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">
            <Globe2 size={14} /> {t.globalKicker}
          </p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">{t.globalHeading}</h2>
          <p className="mb-8 max-w-2xl text-ink/70">{t.globalBody}</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_COUNTRIES.map((c) => (
              <span key={c.code} className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink/70">
                {c.name} <span className="text-ink/40">· {c.currency}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/50">
            {t.dontSeeCountry}{' '}
            <a href="mailto:hello@elorgeschools.com" className="text-brand-blue underline">
              {t.talkToUs}
            </a>{' '}
            {t.addingCorridors}
          </p>
        </div>
      </section>

      {/* Session Wrap */}
      <section id="session-wrap" className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.sessionWrapKicker}</p>
            <h2 className="mb-4 font-display text-3xl font-semibold">{t.sessionWrapHeading}</h2>
            <p className="text-ink/70">{t.sessionWrapBody}</p>
          </div>
          <div className="rounded-2xl bg-ink p-8 text-white torn-edge">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.sessionWrapKicker}</p>
            <h3 className="mt-1 font-display text-xl font-semibold">{t.sessionWrapCardYear}</h3>
            <p className="mt-1 text-sm text-white/60">{t.sessionWrapCardTerms}</p>
            <div className="mt-6 flex flex-col gap-2">
              {[
                ['Mathematics', 89],
                ['Chemistry', 81],
                ['English', 66],
              ].map(([subject, score]) => (
                <div key={subject as string} className="flex items-center gap-2 text-sm">
                  <span className="w-28 shrink-0 text-white/70">{subject}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className={`block h-full ${(score as number) >= 70 ? 'bg-brand-green' : 'bg-amber'}`}
                      style={{ width: `${score}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right font-mono text-xs">{score}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">{t.fieldsWorthExploring}</p>
              <div className="flex flex-wrap gap-2">
                {['Engineering', 'Computer Science', 'Chemical Engineering'].map((f) => (
                  <span key={f} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CBT */}
      <section id="cbt" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.cbtKicker}</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">{t.cbtHeading}</h2>
          <p className="mb-10 max-w-2xl text-ink/70">{t.cbtBody}</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.cbtFeatures.map((feature) => (
              <div key={feature.title}>
                <h3 className="mb-2 font-display text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-ink/60">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lesson Notes & Presenter Mode */}
      <section id="lesson-notes" className="border-t border-black/5 px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.lessonNotesKicker}</p>
            <h2 className="mb-4 font-display text-3xl font-semibold">{t.lessonNotesHeading}</h2>
            <p className="mb-6 text-ink/70">{t.lessonNotesBody}</p>
            <div className="flex flex-col gap-3">
              {t.lessonNotesFeatures.map((feature, i) => {
                const Icon = LESSON_NOTE_ICONS[i];
                return (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                      {Icon && <Icon size={16} />}
                    </div>
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-ink/60">{feature.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signature element: a mocked projector slide with a whiteboard scribble accent */}
          <div className="relative rounded-2xl bg-ink p-8 text-white">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-green">{t.presentationLabel}</p>
            <p className="mb-2 text-sm text-white/50">{t.presentationSubject}</p>
            <h3 className="mb-6 font-display text-2xl font-semibold leading-snug">
              {t.presentationTitle} <br />
              <span className="text-brand-green">2x + 5 = 15</span>
            </h3>
            <svg viewBox="0 0 300 60" className="mb-6 w-full opacity-80">
              <path
                d="M10,45 Q40,10 70,35 T140,25 Q160,15 180,40 T260,20"
                fill="none"
                stroke="#F08C00"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="180" cy="40" r="14" fill="none" stroke="#F08C00" strokeWidth="3" />
            </svg>
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>3 / 6</span>
              <span className="flex items-center gap-1">
                <Pencil size={12} /> {t.whiteboardActive}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Offline-first */}
      <section id="offline" className="px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-2xl bg-ink px-8 py-14 text-center text-white">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.offlineKicker}</p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold">{t.offlineHeading}</h2>
          <p className="max-w-xl text-white/70">{t.offlineBody}</p>
        </div>
      </section>

      {/* Finance suite */}
      <section id="finance" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.financeKicker}</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">{t.financeHeading}</h2>
          <p className="mb-10 max-w-2xl text-ink/70">{t.financeBody}</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.financeFeatures.map((feature, i) => {
              const Icon = FINANCE_ICONS[i];
              return (
                <div key={feature.title} className="rounded-xl border border-black/5 p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 font-display text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm text-ink/60">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Running the whole school */}
      <section id="operations" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.operationsHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.runSchoolFeatures.map((feature) => (
              <div key={feature.title} className="border-l-2 border-brand-green/20 pl-5">
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-ink/60">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware & infrastructure */}
      <section id="infrastructure" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.infrastructureKicker}</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">{t.infrastructureHeading}</h2>
          <p className="mb-10 max-w-2xl text-ink/70">{t.infrastructureBody}</p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.infrastructureFeatures.map((feature, i) => {
              const Icon = INFRASTRUCTURE_ICONS[i];
              return (
                <div key={feature.title} className="rounded-xl border border-black/5 p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 font-display text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm text-ink/60">{feature.body}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-ink/50">
            {t.interestedInThis}{' '}
            <a href="mailto:hello@elorgeschools.com" className="text-brand-blue underline">
              {t.talkToUs}
            </a>{' '}
            {t.advisePrefix}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-black/5 bg-white px-6 py-20">
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

      {/* Credibility */}
      <section className="border-t border-black/5 px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-ink/50">{t.credibility}</p>
      </section>

      {/* Final CTA */}
      <section id="whatsapp-avoid" className="border-t border-black/5 bg-white px-6 py-20 text-center">
        <h2 className="mb-6 font-display text-3xl font-semibold">{t.finalCtaHeading}</h2>
        <Link href="/signup" className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark">
          {t.getStarted}
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
