// web/app/features/id-cards/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CreditCard, ScanLine, WifiOff, UserCheck, Printer, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School ID Cards & Gate Attendance Software',
  description:
    'Issue digital student and staff ID cards the day someone is registered, print them on standard CR80 cards, and take attendance by scanning a QR code at the gate — even when the gate has no signal.',
  alternates: { canonical: '/features/id-cards' },
  openGraph: {
    title: 'School ID Cards & Gate Attendance Software',
    description: 'Digital ID cards, printable CR80 cards, and QR gate attendance that works offline.',
    url: 'https://elorgeschools.org/features/id-cards',
  },
};

const HOW_IT_WORKS = [
  {
    icon: UserCheck,
    title: 'Register, and the card exists',
    body: 'A student or staff member gets a digital ID with a unique QR code the moment they are registered. Staff can also request their own card, and an admin approves it.',
  },
  {
    icon: Printer,
    title: 'Print on standard cards',
    body: 'Cards render as print-ready CR80 PDFs — student cards in portrait, staff cards in landscape and a different colour, so a gate guard can tell them apart at a glance.',
  },
  {
    icon: ScanLine,
    title: 'Scan at the gate',
    body: 'A phone or a QR/barcode scanner records arrival time against the card. Attendance builds itself — nobody calls a register.',
  },
];

const FEATURES = [
  {
    icon: WifiOff,
    title: 'Scans save even with no signal',
    body: 'If the gate has no connection that morning, scans queue on the device and sync when it returns, with each scan keeping its true arrival time.',
  },
  {
    icon: CreditCard,
    title: 'Your school, not ours',
    body: 'Cards carry your school logo, name and head-of-school signature — never Elorge branding.',
  },
  {
    icon: ShieldCheck,
    title: 'Hard to fake or backdate',
    body: 'Scan times are checked against a sensible window, so a wrong device clock or a deliberately backdated scan cannot quietly corrupt attendance.',
  },
];

const FAQS = [
  {
    q: 'Do ID cards cost extra?',
    a: 'No. Generating digital ID cards is bundled with the platform and does not draw from your wallet. Only physical printing equipment is separate.',
  },
  {
    q: 'What do we need to print cards?',
    a: 'A card printer and blank CR80 (credit-card size) cards. If you are setting this up for the first time, we can point you to the right equipment and help you get going.',
  },
  {
    q: 'Can staff get ID cards too?',
    a: 'Yes. Staff cards use their own landscape layout and department or designation, and can be requested by the staff member and approved by an admin.',
  },
  {
    q: 'What do we need at the gate?',
    a: 'A phone or tablet running Elorge, or a QR/barcode scanner matched to the attendance flow. It keeps working through outages.',
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

export default function IdCardsFeaturePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">ID cards & attendance</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            An ID card on day one. Attendance that takes itself.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            Issue a digital ID the day someone is registered, print it on a standard card, and record arrivals with a
            single scan at the gate — whether or not the internet is up.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/signup" className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:bg-brand-blue-dark">
              Get started
            </Link>
            <Link href="/pricing" className="rounded-full border border-black/10 px-6 py-3 font-medium text-ink transition hover:bg-black/5">
              See pricing
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">From registration to the gate.</h2>
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
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">Built for a real school gate.</h2>
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

        {/* FAQ */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold text-ink">Common questions.</h2>
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
          <h2 className="mb-6 font-display text-3xl font-semibold">Ready to issue your first ID cards?</h2>
          <Link href="/signup" className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark">
            Get started
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
