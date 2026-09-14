// web/app/page.tsx
import type { Metadata } from 'next';
import HomePageContent from '@/components/marketing/HomePageContent';

export const metadata: Metadata = {
  title: 'Elorge Schools — CBT, Verifiable Results & Lesson Notes for Schools Anywhere',
  description:
    'The school management platform with computer-based testing (CBT), QR-verifiable report cards, online result checking, lesson notes with presenter mode, ID cards, fees, and offline-first design — built for schools in Nigeria, Ghana, Kenya, and beyond.',
  alternates: { canonical: '/' },
};

// No fixed `offers.priceCurrency` here on purpose — a school in Lagos pays
// in NGN, one in Nairobi pays in KES, one in Accra pays in GHS. A single
// hardcoded currency in structured data would just be wrong for most
// schools on the platform; better to omit it than assert something false.
//
// This structured data intentionally stays in English regardless of
// visitor language — JSON-LD is read by search engine crawlers, not
// rendered to visitors, and Google recommends keeping schema.org markup
// in the page's primary indexed language rather than per-visitor locale.
const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Elorge Schools',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web, Android, iOS',
  description:
    'School management software with computer-based testing, verifiable results, lesson notes, ID cards, attendance, fees, and offline-first design — for schools anywhere, billed in your own currency.',
  featureList: [
    'Computer-based testing (CBT)',
    'QR-verifiable result checking',
    'Lesson notes with presenter mode',
    'Digital ID cards and gate attendance',
    'Fees, invoicing and wallet — in your own currency',
    'Offline-first, works without internet',
  ],
};

const FAQS_EN = [
  {
    q: 'How does a parent check a school result online with Elorge?',
    a: 'A parent visits the school\'s results page, enters the student\'s Admission ID and a result PIN issued by the school, and sees a verified, QR-stamped report card — no account required.',
  },
  {
    q: 'Does Elorge support computer-based testing (CBT)?',
    a: 'Yes. Schools with a computer lab can build a question bank, publish scheduled tests with a spoken access code, and objective questions grade instantly. Schools without a lab can skip CBT entirely and enter scores by hand.',
  },
  {
    q: 'Can teachers write and present lesson notes on Elorge?',
    a: 'Yes. Teachers write lesson notes in a structured format — objectives, previous knowledge, presentation, evaluation, assignment — then turn any note into a full-screen slide deck for the projector with one click, complete with a built-in whiteboard.',
  },
  {
    q: 'Does Elorge work without internet access?',
    a: 'Yes. Elorge is installable as an app on phone or desktop and keeps working through outages — registering students, entering scores, and sitting CBT tests offline — syncing everything the moment connectivity returns.',
  },
  {
    q: 'Is Elorge only for schools in Nigeria?',
    a: 'No. Elorge started in Nigeria and now onboards schools in several countries, each billed in its own currency through Flutterwave — your school\'s academic structure (terms, semesters, or quarters) and subject list are entirely your own too, not fixed to any one country\'s curriculum.',
  },
  {
    q: 'What academic calendar does Elorge assume — terms, semesters, or something else?',
    a: 'Whatever your school actually uses. A school can run 2 semesters, 3 terms, 4 quarters, or any other structure, and label periods however they normally would — nothing is hardcoded to one country\'s academic calendar.',
  },
];

// JSON-LD FAQ markup stays in English for the same reason as softwareJsonLd
// above — this is what Google indexes, independent of what a visitor sees
// rendered on the page (see components/marketing/HomePageContent.tsx for
// the actual localized FAQ copy shown to visitors).
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS_EN.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePageContent />
    </>
  );
}
