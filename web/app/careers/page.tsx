// web/app/careers/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CareersPageContent from '@/components/marketing/CareersPageContent';

export const metadata: Metadata = {
  title: 'Careers at Elorge Technologies',
  description:
    'Join the team building school management software for Nigerian schools — engineering, education, and operations roles.',
  alternates: { canonical: '/careers' },
};

export default function CareersPage() {
  return (
    <>
      <SiteHeader />
      <CareersPageContent />
      <SiteFooter />
    </>
  );
}
