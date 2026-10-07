// web/app/pricing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Wallet, Gift, CreditCard, Globe2, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — Pay Per Student, No Subscription',
  description:
    'Elorge Schools charges a small per-student fee, per term, from a prepaid wallet in your own currency. Start with a free welcome credit — no monthly subscription.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Elorge Schools Pricing — Pay Per Student, No Subscription',
    description: 'A prepaid wallet in your own currency, a small per-student fee per term, and a free welcome credit to start.',
    url: 'https://elorgeschools.org/pricing',
  },
};

// Amounts are deliberately not shown: Elorge bills each school in its own
// currency and the per-student rate can differ by country or school, so any
// single figure here would be wrong for most visitors.

const HOW_IT_WORKS = [
  {
    icon: Gift,
    title: 'Start with a welcome credit',
    body: 'Every new school gets a one-time welcome credit in its wallet. We will not tell you how much — but who knows, it might just keep your school running free for a very long time.',
  },
  {
    icon: Wallet,
    title: 'Top up your wallet when you need to',
    body: 'Add funds to a prepaid school wallet in your own currency. There is no monthly plan to keep paying while school is on break.',
  },
  {
    icon: CreditCard,
    title: 'Pay per student, per term',
    body: 'When you unlock results or run a CBT for a student, the fee comes out of the wallet. A student is never charged twice for the same term.',
  },
];

const INCLUDED = [
  'Results and QR-verified report cards',
  'Computer-based testing (CBT)',
  'Lesson notes with presenter mode',
  'Digital ID cards and gate attendance',
  'Fees, invoicing and school accounting',
  'Staff records, payroll and leave',
  'Offline-first apps for phone and desktop',
];

const FAQS = [
  {
    q: 'Is there a monthly or yearly subscription?',
    a: 'No. Elorge is pay-as-you-go from a prepaid wallet. You only pay when you generate result PINs or run a CBT for students.',
  },
  {
    q: 'What does digital ID card generation cost?',
    a: 'Generating digital ID cards is bundled in — it does not draw from your wallet. Physical printing hardware is separate and optional.',
  },
  {
    q: 'What currency will I be billed in?',
    a: 'Your own. Each school is billed in its local currency through Flutterwave, and the per-student price is set for your country.',
  },
  {
    q: 'Can larger schools get a different rate?',
    a: 'Yes. Pricing can be adjusted for a school, so if you have a large student body or special circumstances, get in touch and we will work out what fits.',
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

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Pricing</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Pay for the students you teach. Nothing else.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            No monthly subscription. A small fee per student, per term, from a prepaid wallet you control — in your own
            currency.
          </p>
        </section>

        {/* Price card */}
        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="stat-hero">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">How it is priced</p>
              <p className="mt-2 font-display text-4xl font-semibold leading-tight">A small fee per student, per term</p>
              <p className="mt-4 text-sm text-white/80">
                Charged in your own currency at a rate set for your country. Sign up to see the exact rate for your
                school, or talk to us if you would like it tailored.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-brand-blue transition hover:bg-white/90"
              >
                Start with a free welcome credit
              </Link>
            </div>

            <div className="card flex flex-col gap-3">
              <p className="font-display text-lg font-semibold">Everything is included</p>
              <ul className="flex flex-col gap-2">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink/70">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">How the wallet works.</h2>
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

        {/* Global note */}
        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-ink px-8 py-12 text-center text-white">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">
              <Globe2 size={14} /> Billed in your currency
            </p>
            <p className="max-w-xl text-white/70">
              Schools in Nigeria, Ghana, Kenya and beyond top up and pay in their own currency through Flutterwave —
              no dollar conversion surprises.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold text-ink">Pricing questions.</h2>
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
          <h2 className="mb-6 font-display text-3xl font-semibold">Sign up and find out how far your welcome credit goes.</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
            >
              Get started
            </Link>
            <Link href="/demo" className="inline-block rounded-full border border-black/10 px-8 py-3 font-medium text-ink transition hover:bg-black/5">
              Book a demo
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
