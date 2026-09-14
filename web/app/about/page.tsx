// web/app/about/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AboutPageContent from '@/components/marketing/AboutPageContent';

export const metadata: Metadata = {
  title: 'About Elorge Technologies — School Software Built in Nigeria, Serving Schools Beyond It',
  description:
    'Meet the team behind Elorge Schools: education, engineering, security, and legal expertise building school management software for Nigeria — and now schools in other countries too.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <AboutPageContent />
      <SiteFooter />
    </>
  );
}
