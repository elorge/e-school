// web/app/about/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AboutPageContent from '@/components/marketing/AboutPageContent';
import { aboutLabelsFor } from '@/lib/i18n/about-labels';
import { SITE_URL, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Elorge Technologies — School Software Built in Nigeria, Serving Schools Beyond It',
  description:
    'Meet the team behind Elorge Schools: education, engineering, security, and legal expertise building school management software for Nigeria — and now schools in other countries too.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Elorge Technologies — The Team Behind Elorge Schools',
    description: 'Education, engineering, security and law in one room, building verifiable, offline-first school software.',
    url: `${SITE_URL}/about`,
  },
};

// Structured data stays in English regardless of visitor language — it is
// read by search crawlers, not rendered to visitors (same convention as
// the homepage). Team roles come from the English copy so there is one
// source of truth for them.
const en = aboutLabelsFor('en');
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${SITE_URL}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Elorge Technologies Limited',
    url: SITE_URL,
    email: CONTACT_EMAIL,
    employee: Object.entries(en.team).map(([name, copy]) => ({
      '@type': 'Person',
      name,
      jobTitle: copy.role,
    })),
  },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <SiteHeader />
      <AboutPageContent />
      <SiteFooter />
    </>
  );
}
