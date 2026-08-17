// web/app/results/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { QrCode, ShieldCheck, Search, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Check School Result Online — Verified, QR-Stamped Report Cards',
  description:
    'How to check a school result online on Elorge: enter an Admission ID and result PIN to see a QR-verified report card. If your school uses Elorge, your school gives you the link and PIN.',
  alternates: { canonical: '/results' },
  openGraph: {
    title: 'Check School Result Online — Verified, QR-Stamped Report Cards',
    description: 'Every Elorge report card carries a QR stamp a parent can scan to confirm it\'s real.',
    url: 'https://elorgeschools.com/results',
  },
};

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Go to your school\'s Elorge page',
    body: 'Your school gives you a web address specific to them — something like elorgeschools.com/yourschool/results.',
  },
  {
    icon: ShieldCheck,
    title: 'Enter the Admission ID and result PIN',
    body: 'Both are issued by the school. No account or password to create — just the two codes tied to your child\'s record.',
  },
  {
    icon: QrCode,
    title: 'See a verified, QR-stamped report card',
    body: 'Every result carries a QR code you or anyone else can scan to confirm it\'s the genuine record on file — not a doubtful photocopy.',
  },
];

const FAQS = [
  {
    q: 'How do I check my child\'s school result online?',
    a: 'Your school provides a results link specific to them, plus an Admission ID and result PIN for your child. Enter both on that page to see a verified report card — no account needed.',
  },
  {
    q: 'What is a result PIN and where do I get one?',
    a: 'A result PIN is a code your school issues per term to unlock a student\'s report card online. Contact your school\'s admin office if you don\'t have one.',
  },
  {
    q: 'How can I tell if a result is genuine?',
    a: 'Every Elorge report card carries a QR stamp. Scanning it confirms the result matches the record on file at the school — so a result can\'t be altered or faked after the fact.',
  },
  {
    q: 'My school isn\'t on Elorge yet — can I still check a result here?',
    a: 'No — results are specific to each school\'s own Elorge workspace. If your school hasn\'t signed up, ask them, or share this page with your school\'s administration.',
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

export default function ResultsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Check a result</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            A result you don't have to take anyone's word for.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            Every report card issued through Elorge carries a QR stamp a parent can scan to confirm it's real. Here's
            how checking a result actually works.
          </p>
        </section>

        {/* Important clarifying note — this page cannot itself check a result */}
        <section className="px-6 pb-16">
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl border border-amber/30 bg-amber/10 p-5 text-left">
            <Smartphone className="mt-0.5 shrink-0 text-amber" size={20} />
            <p className="text-sm text-ink/70">
              This page explains how result checking works — it isn't itself a results portal. Your specific school
              gives you a link like <span className="font-mono text-xs">elorgeschools.com/yourschool/results</span>,
              along with an Admission ID and PIN for your child.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">Three steps, no account required.</h2>
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

        {/* FAQ */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold text-ink">Common questions about checking a result.</h2>
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

        {/* CTA — split for parents vs schools */}
        <section className="border-t border-black/5 bg-white px-6 py-20 text-center">
          <h2 className="mb-4 font-display text-3xl font-semibold">Is your school on Elorge yet?</h2>
          <p className="mx-auto mb-6 max-w-md text-ink/60">
            If your school hasn't set up verified results, ID cards, and CBT yet, point them here.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Bring your school onto Elorge
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}