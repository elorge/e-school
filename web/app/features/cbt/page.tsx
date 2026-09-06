// web/app/features/cbt/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CheckCircle2, Clock, WifiOff, ShieldCheck, FileSpreadsheet, KeyRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School CBT Software — Computer-Based Testing for Nigerian Schools',
  description:
    'Run computer-based tests (CBT) at your school with scheduled access codes, instant objective grading, and offline answer-saving. Scores flow straight into the same QR-verified report card — no separate system.',
  alternates: { canonical: '/features/cbt' },
  openGraph: {
    title: 'School CBT Software — Computer-Based Testing for Nigerian Schools',
    description:
      'Scheduled tests, instant grading, and offline-safe answers — computer-based testing built into your school\'s existing records.',
    url: 'https://elorgeschools.org/features/cbt',
  },
};

const HOW_IT_WORKS = [
  {
    icon: FileSpreadsheet,
    title: 'Build a question bank',
    body: 'Type questions in directly, or download a template, fill it in Excel offline, and upload the whole bank in one go.',
  },
  {
    icon: KeyRound,
    title: 'Schedule it, get an access code',
    body: 'Set a date and time window. Students log in with just their Admission ID and a spoken access code — no accounts to create ahead of time.',
  },
  {
    icon: CheckCircle2,
    title: 'Objective scores grade instantly',
    body: 'Multiple-choice and objective questions mark themselves the moment a student submits. A teacher adds the theory score once submissions close.',
  },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Scheduled, not open-ended',
    body: 'A test\'s access code only works on its scheduled day, within a set window — not next week, not next month. No pre-leaked question banks sitting live for days.',
  },
  {
    icon: WifiOff,
    title: 'Works if the lab loses signal',
    body: 'Answers save to the device first and sync the moment connectivity returns. A dropped connection mid-test never costs a student their progress.',
  },
  {
    icon: ShieldCheck,
    title: 'One result, one PIN',
    body: 'The combined CBT and theory score flows straight into the same report card, protected by the same parent PIN — nothing separate for a parent to track down.',
  },
];

const FAQS = [
  {
    q: 'Do we need a full computer lab to use CBT on Elorge?',
    a: 'No. CBT is entirely optional. Schools without a lab enter every score by hand and use the rest of the platform — results, ID cards, fees — without ever touching computer-based testing.',
  },
  {
    q: 'What happens if the internet goes down during a test?',
    a: 'A student\'s answers save to their device as they go. The moment connectivity returns, whether seconds or hours later, everything syncs automatically — no progress is lost.',
  },
  {
    q: 'How do students log in to sit a CBT?',
    a: 'With their Admission ID and a spoken access code the invigilator provides on the scheduled day — no student accounts or passwords to set up beforehand.',
  },
  {
    q: 'Can we reuse the same question bank for a different class or term?',
    a: 'Yes. A question bank stays on file and can be scheduled again for a different class, term, or session, or edited before reuse.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function CbtFeaturePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Computer-based testing</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            CBT that doesn't fall over when the lab loses signal.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            Schedule a test, hand out an access code, and let objective questions grade themselves — with answers
            that save locally first, so a dropped connection never costs a student their work.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
            >
              Get started
            </Link>
            <Link href="/#cbt" className="rounded-full border border-black/10 px-6 py-3 font-medium text-ink transition hover:bg-black/5">
              See it on the homepage
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">How a CBT actually runs, start to finish.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">
                    {i + 1}. {title}
                  </h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">Built for the way a Nigerian lab actually behaves.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="border-l-2 border-brand-green/20 pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* No lab required reassurance */}
        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-ink px-8 py-12 text-center text-white">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">No lab? No problem.</p>
            <p className="max-w-xl text-white/70">
              CBT is one feature among many, not a requirement. Schools without a computer lab use every other part
              of Elorge — results, ID cards, attendance, fees — and enter scores by hand instead.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold text-ink">Common questions about CBT.</h2>
            <div className="flex flex-col gap-8">
              {FAQS.map((faq) => (
                <div key={faq.q}>
                  <h3 className="mb-2 font-display text-lg font-semibold text-ink">{faq.q}</h3>
                  <p className="text-sm text-ink/60">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-black/5 px-6 py-20 text-center">
          <h2 className="mb-6 font-display text-3xl font-semibold">Ready to run your first CBT?</h2>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Get started
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}