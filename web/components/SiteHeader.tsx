// web/components/SiteHeader.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'session-wrap', label: 'Session Wrap' },
  { id: 'cbt', label: 'CBT' },
  { id: 'finance', label: 'Finance' },
  { id: 'lesson-notes', label: 'Lesson Notes' },
  { id: 'offline', label: 'Offline-first' },
  { id: 'infrastructure', label: 'Hardware' },
];

// Standalone pages (not homepage anchors) worth surfacing in the main
// nav. Kept separate from SECTIONS since these aren't scroll-spied —
// they're always-static links to their own indexable page.
const PAGE_LINKS = [{ href: '/results', label: 'Check Result' }];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
          <Link href="/login" className="text-sm text-ink/70 hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Get started
          </Link>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
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
          <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3">
            <Link href="/login" className="py-2 text-sm text-ink/70" onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand-blue px-4 py-2 text-center text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}