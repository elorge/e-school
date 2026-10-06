// web/app/contact/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ContactPageContent from '@/components/marketing/ContactPageContent';

export const metadata: Metadata = {
  title: 'Contact Elorge Schools',
  description:
    'Get in touch about setting up your school on Elorge, pricing, or support — email or live chat, a real person replies.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <ContactPageContent />
      <SiteFooter />
    </>
  );
}
