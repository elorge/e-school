// web/components/SiteHeader.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X, Globe2 } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { siteHeaderLabelsFor } from '@/lib/i18n/site-header-labels';
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '@/lib/locale';

export default function SiteHeader() {
  const { locale, setLocale } = useMarketingLocale();
  const t = siteHeaderLabelsFor(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const SECTIONS = [
    { id: 'features', label: t.sectionFeatures },
    { id: 'session-wrap', label: t.sectionSessionWrap },
    { id: 'cbt', label: t.sectionCbt },
    { id: 'finance', label: t.sectionFinance },
    { id: 'lesson-notes', label: t.sectionLessonNotes },
    { id: 'offline', label: t.sectionOffline },
    { id: 'infrastructure', label: t.sectionInfrastructure },
  ];

  // Standalone pages (not homepage anchors) worth surfacing in the main
  // nav. Kept separate from SECTIONS since these aren't scroll-spied —
  // they're always-static links to their own indexable page.
  const PAGE_LINKS = [{ href: '/results', label: t.checkResult }];

  // Highlights whichever section is currently in view, so the nav
  // reflects scroll position instead of staying static the whole time.
  // These sections only exist on the homepage, so on other pages this
  // simply finds nothing to observe and activeSection stays null.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Elorge Schools" width={44} height={44} priority />
          <span className="font-display text-xl font-semibold tracking-tight">Elorge Schools</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              className={`transition ${activeSection === `#${s.id}` ? 'font-medium text-brand-blue' : 'text-ink/60 hover:text-ink'}`}
            >
              {s.label}
            </a>
          ))}
          {PAGE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-ink/60 transition hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen((o) => !o)}
              aria-label={t.language}
              className="flex items-center gap-1 text-sm text-ink/60 hover:text-ink"
            >
              <Globe2 size={16} /> {LOCALE_LABELS[locale]}
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-black/10 bg-white py-1 shadow-lg">
                {SUPPORTED_LOCALES.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLocale(l);
                      setLangMenuOpen(false);
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-black/5 ${l === locale ? 'font-medium text-brand-blue' : 'text-ink/70'}`}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/login" className="text-sm text-ink/70 hover:text-ink">
            {t.signIn}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-blue-dark"
          >
            {t.getStarted}
          </Link>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label={t.toggleMenu}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/5 px-6 py-4 lg:hidden">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`/#${s.id}`} className="py-2 text-sm text-ink/70" onClick={() => setMobileOpen(false)}>
              {s.label}
            </a>
          ))}
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-2 text-sm text-ink/70"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`rounded-full px-3 py-1 text-xs ${l === locale ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3">
            <Link href="/login" className="py-2 text-sm text-ink/70" onClick={() => setMobileOpen(false)}>
              {t.signIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand-blue px-4 py-2 text-center text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              {t.getStarted}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
