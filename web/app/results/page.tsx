// web/app/results/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ResultsMarketingContent from '@/components/marketing/ResultsMarketingContent';

export const metadata: Metadata = {
  title: 'Check School Result Online — Verified, QR-Stamped Report Cards',
  description:
    'How to check a school result online on Elorge: enter an Admission ID and result PIN to see a QR-verified report card. If your school uses Elorge, your school gives you the link and PIN.',
  alternates: { canonical: '/results' },
  openGraph: {
    title: 'Check School Result Online — Verified, QR-Stamped Report Cards',
    description: 'Every Elorge report card carries a QR stamp a parent can scan to confirm it\'s real.',
    url: 'https://elorgeschools.org/results',
  },
};

// FAQ JSON-LD stays in English regardless of visitor locale — this is
// crawler-facing structured data, not rendered content (see the same
// note in app/page.tsx). The translated FAQ visitors actually see lives
// in ResultsMarketingContent / results-marketing-labels.ts.
const FAQS_EN = [
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
  mainEntity: FAQS_EN.map((f) => ({
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
      <ResultsMarketingContent />
      <SiteFooter />
    </>
  );
}
