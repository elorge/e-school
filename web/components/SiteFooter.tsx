// web/components/SiteFooter.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { XIcon, FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './icons/SocialIcons';
import TikTokIcon from './icons/TikTokIcon';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const PRODUCT_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#session-wrap', label: 'Session Wrap' },
  { href: '/#cbt', label: 'Computer-Based Testing' },
  { href: '/#finance', label: 'Fees, Inventory & Accounting' },
  { href: '/#lesson-notes', label: 'Lesson Notes' },
  { href: '/#offline', label: 'Offline-first' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

const SOCIAL_LINKS: { label: string; href: string | undefined; Icon: React.ComponentType<{ size?: number }> }[] = [
  { label: 'X', href: process.env.NEXT_PUBLIC_X_URL, Icon: XIcon },
  { label: 'Facebook', href: process.env.NEXT_PUBLIC_FACEBOOK_URL, Icon: FacebookIcon },
  { label: 'Instagram', href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, Icon: InstagramIcon },
  { label: 'LinkedIn', href: process.env.NEXT_PUBLIC_LINKEDIN_URL, Icon: LinkedInIcon },
  { label: 'TikTok', href: process.env.NEXT_PUBLIC_TIKTOK_URL, Icon: TikTokIcon },
  { label: 'YouTube', href: process.env.NEXT_PUBLIC_YOUTUBE_URL, Icon: YouTubeIcon },
];

export default function SiteFooter() {
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
            <p className="mb-4 max-w-xs text-sm text-ink/60">
              School management built for Nigerian schools — records, results, and finances that work even when
              the internet doesn't.
            </p>
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Product</p>
            <ul className="flex flex-col gap-2">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-ink/60 hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Company</p>
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Get in touch</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="mailto:hello@elorgeschools.com" className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
                  <Mail size={14} /> hello@elorgeschools.com
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
                    <MessageCircle size={14} /> Chat on WhatsApp
                  </a>
                </li>
              )}
              <li>
                <Link href="/signup" className="text-sm text-brand-blue underline">
                  Get started →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 text-xs text-ink/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Elorge Technologies Limited — Software Development &amp; IT Infrastructure</span>
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