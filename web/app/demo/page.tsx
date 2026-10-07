// web/app/demo/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import DemoPageContent from '@/components/marketing/DemoPageContent';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book a Demo — See Elorge Schools in Action',
  description:
    'Book a walkthrough of Elorge Schools: verifiable results, computer-based testing, ID cards, fees and offline-first apps — shown working for a school like yours.',
  alternates: { canonical: '/demo' },
  openGraph: {
    title: 'Book a Demo — Elorge Schools',
    description: 'A walkthrough of results, CBT, ID cards and fees, with your questions answered for your country.',
    url: `${SITE_URL}/demo`,
  },
};

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <DemoPageContent />
      <SiteFooter />
    </>
  );
}
