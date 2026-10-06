// web/components/SiteFooter.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { XIcon, FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './icons/SocialIcons';
import TikTokIcon from './icons/TikTokIcon';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { siteFooterLabelsFor } from '@/lib/i18n/site-footer-labels';
import { CONTACT_EMAIL } from '@/lib/site';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const SOCIAL_LINKS: { label: string; href: string | undefined; Icon: React.ComponentType<{ size?: number }> }[] = [
  { label: 'X', href: process.env.NEXT_PUBLIC_X_URL, Icon: XIcon },
  { label: 'Facebook', href: process.env.NEXT_PUBLIC_FACEBOOK_URL, Icon: FacebookIcon },
  { label: 'Instagram', href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, Icon: InstagramIcon },
  { label: 'LinkedIn', href: process.env.NEXT_PUBLIC_LINKEDIN_URL, Icon: LinkedInIcon },
  { label: 'TikTok', href: process.env.NEXT_PUBLIC_TIKTOK_URL, Icon: TikTokIcon },
  { label: 'YouTube', href: process.env.NEXT_PUBLIC_YOUTUBE_URL, Icon: YouTubeIcon },
];

export default function SiteFooter() {
  const { locale } = useMarketingLocale();
  const t = siteFooterLabelsFor(locale);

  // Links to dedicated pages where one exists (better for SEO than a
  // same-page anchor — these pages target specific searches like
  // "school CBT software" or "check school result online"). Sections
  // without their own page still point back to the homepage anchor.
  const PRODUCT_LINKS = [
    { href: '/#features', label: t.linkFeatures },
    { href: '/#session-wrap', label: t.linkSessionWrap },
    { href: '/features/cbt', label: t.linkCbt },
    { href: '/#finance', label: t.linkFinance },
    { href: '/features/lesson-notes', label: t.linkLessonNotes },
    { href: '/features/id-cards', label: t.linkIdCards },
    { href: '/pricing', label: t.linkPricing },
    { href: '/results', label: t.linkCheckResult },
    { href: '/#offline', label: t.linkOffline },
  ];

  const COMPANY_LINKS = [
    { href: '/about', label: t.linkAbout },
    { href: '/careers', label: t.linkCareers },
    { href: '/contact', label: t.linkContact },
  ];

  const LEGAL_LINKS = [
    { href: '/terms', label: t.linkTerms },
    { href: '/privacy', label: t.linkPrivacy },
  ];

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={32} height={32} aria-hidden />
              <span className="font-display text-lg font-semibold">Elorge Schools</span>
            </Link>
            <p className="mb-4 max-w-xs text-sm text-ink/60">{t.tagline}</p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ href, label, Icon }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-ink/40 hover:text-brand-blue"
                  >
                    <Icon size={17} />
                  </a>
                ) : null,
              )}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">{t.productHeading}</p>
            <ul className="flex flex-col gap-2">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith('/#') ? (
                    <a href={l.href} className="text-sm text-ink/60 hover:text-ink">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-ink/60 hover:text-ink">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">{t.companyHeading}</p>
            <ul className="flex flex-col gap-2">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/60 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">{t.getInTouchHeading}</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
                  <Mail size={14} /> {CONTACT_EMAIL}
                </a>
              </li>
              {WHATSAPP_NUMBER && (
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink"
                  >
                    <MessageCircle size={14} /> {t.chatOnWhatsApp}
                  </a>
                </li>
              )}
              <li>
                <Link href="/signup" className="text-sm text-brand-blue underline">
                  {t.getStarted}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 text-xs text-ink/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {t.copyright}</span>
          <div className="flex gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink/70">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
