// web/app/layout.tsx
import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import InstallPrompt from '@/components/InstallPrompt';
import WhatsAppButton from '@/components/WhatsAppButton';
import MustChangePasswordGate from '@/components/MustChangePasswordGate';
import { MarketingLocaleProvider } from '@/lib/marketing-locale';
import { CONTACT_EMAIL } from '@/lib/site';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex-mono', weight: ['500', '600'] });

// TODO: confirm this is your real production domain before deploying.
const SITE_URL = 'https://elorgeschools.org';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Elorge Schools — School Management Software with CBT, Results & Lesson Notes',
    template: '%s | Elorge Schools',
  },
  description:
    'School management software for Africa and beyond: verifiable results, computer-based testing (CBT), lesson notes with presenter mode, ID cards, fees, and a wallet — built to keep working even offline.',
  keywords: [
    'school management software Nigeria',
    'school management software Ghana',
    'school management software Kenya',
    'school management software Africa',
    'school with CBT',
    'computer based testing school software',
    'check school result online',
    'school result checker portal',
    'school with lesson notes',
    'school ID card software',
    'school fees management software',
    'offline school software',
    'school management system',
  ],
  authors: [{ name: 'Elorge Technologies Limited' }],
  creator: 'Elorge Technologies Limited',
  publisher: 'Elorge Technologies Limited',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: 'Elorge Schools',
    title: 'Elorge Schools — School Management Software with CBT, Results & Lesson Notes',
    description:
      'Results, ID cards, attendance, fees, computer-based tests, and lesson notes — in one place, working even when the internet doesn\'t.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Elorge Schools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elorge Schools — School Management Software',
    description: 'CBT, verifiable results, lesson notes, ID cards, fees — offline-first.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: SITE_URL },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-180.png',
  },
};

export const viewport = {
  themeColor: '#0B3D91',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Elorge Technologies Limited',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'School management software company, headquartered in Nigeria, offering CBT, verifiable results, lesson notes, ID cards, attendance, and fee management to schools across Africa and beyond.',
  email: CONTACT_EMAIL,
  sameAs: [
    process.env.NEXT_PUBLIC_X_URL,
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_TIKTOK_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
  ].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <MarketingLocaleProvider>
          {children}
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <WhatsAppButton />
          <MustChangePasswordGate />
        </MarketingLocaleProvider>
      </body>
    </html>
  );
}