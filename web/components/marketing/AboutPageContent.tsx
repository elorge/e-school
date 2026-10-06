// web/components/marketing/AboutPageContent.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SUPPORTED_COUNTRIES } from '@/lib/currency';
import { Linkedin, ShieldCheck, Wifi, Users2, CheckCircle2, Monitor, Presentation, CreditCard, Wallet, ArrowRight } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { aboutLabelsFor } from '@/lib/i18n/about-labels';

// Add each person's real photo to web/public/team/ and point `photo` at it.
// `photo: null` shows their initials instead — used for anyone who does not
// have a real photo yet, so a shared placeholder image never appears on
// several different people. Set `linkedin` to the person's real profile URL;
// while it is null no LinkedIn icon is shown (rather than a dead '#' link).
// Role/bio text lives in AboutLabels.team so it can be translated.
const TEAM_STRUCTURE: { name: string; photo: string | null; linkedin: string | null }[] = [
  { name: 'George Olumah', photo: '/team/founder.jpg', linkedin: null },
  { name: 'Elohor Olumah', photo: '/team/elohor.jpg', linkedin: null },
  { name: 'Gordon Ekpuyama', photo: null, linkedin: null },
  { name: 'Victor Oko', photo: null, linkedin: null },
  { name: 'Shelter Orok', photo: null, linkedin: null },
  { name: 'Mamus Benita', photo: '/team/mamus.jpg', linkedin: null },
];

// Each product card links to its own page (good for visitors and for SEO).
const PRODUCT_LINKS: { href: string; icon: React.ComponentType<{ size?: number | string }> }[] = [
  { href: '/results', icon: CheckCircle2 },
  { href: '/features/cbt', icon: Monitor },
  { href: '/features/lesson-notes', icon: Presentation },
  { href: '/features/id-cards', icon: CreditCard },
  { href: '/pricing', icon: Wallet },
  { href: '/#offline', icon: Wifi },
];

const VALUE_ICONS = [ShieldCheck, Wifi, Users2];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}

export default function AboutPageContent() {
  const { locale } = useMarketingLocale();
  const t = aboutLabelsFor(locale);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.kicker}</p>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t.heroTitle}</h1>
        <p className="max-w-xl text-lg text-ink/70">{t.heroBody}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href="#build" className="btn-primary">{t.heroCtaProducts}</a>
          <a href="#team" className="btn-secondary">{t.heroCtaTeam}</a>
        </div>
      </section>

      {/* Story */}
      <section className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.whyWeExist}</p>
            <h2 className="mb-4 font-display text-3xl font-semibold">{t.storyHeading}</h2>
            <p className="mb-4 text-ink/70">{t.storyP1}</p>
            <p className="text-ink/70">{t.storyP2(SUPPORTED_COUNTRIES.length)}</p>
          </div>
          <div className="rounded-2xl bg-ink p-8 text-white torn-edge">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.inNumbers}</p>
            <div className="flex flex-col gap-5">
              <div>
                <p className="font-display text-3xl font-semibold">1</p>
                <p className="text-sm text-white/60">{t.stat1Body}</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">0</p>
                <p className="text-sm text-white/60">{t.stat2Body}</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">{SUPPORTED_COUNTRIES.length}</p>
                <p className="text-sm text-white/60">{t.stat3Body}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we build */}
      <section id="build" className="scroll-mt-20 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.buildKicker}</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold text-ink">{t.buildHeading}</h2>
          <p className="mb-10 max-w-2xl text-ink/70">{t.buildBody}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.products.map(({ title, body }, i) => {
              const { href, icon: Icon } = PRODUCT_LINKS[i];
              return (
                <Link key={title} href={href} className="card group flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="flex-1 text-sm text-ink/60">{body}</p>
                  <span className="flex items-center gap-1 text-sm font-medium text-brand-blue">
                    {t.learnMore} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Where we work */}
      <section className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.workKicker}</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold text-ink">{t.workHeading}</h2>
          <p className="mb-8 max-w-2xl text-ink/70">{t.workBody}</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_COUNTRIES.map((c) => (
              <span key={c.code} className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink/70">
                {c.name} <span className="text-ink/40">· {c.currency}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/50">{t.workMissing}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.valuesHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.values.map(({ title, body }, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <div key={title} className="border-l-2 border-brand-blue/20 pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-20 border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.teamKicker}</p>
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.teamHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {TEAM_STRUCTURE.map((member) => {
              const copy = t.team[member.name];
              return (
                <div key={member.name} className="card flex flex-col gap-4 p-6 sm:flex-row">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={112}
                      height={112}
                      className="h-28 w-28 shrink-0 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-2xl font-semibold text-brand-blue shadow-md">
                      {initials(member.name)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold">{member.name}</p>
                      {member.linkedin && (
                        <Link
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t.linkedinAriaLabel(member.name)}
                          className="text-ink/40 transition hover:text-brand-blue"
                        >
                          <Linkedin size={16} />
                        </Link>
                      )}
                    </div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-brand-green">{copy.role}</p>
                    <p className="text-sm leading-relaxed text-ink/60">{copy.bio}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-black/5 px-6 py-20 text-center">
        <h2 className="mb-4 font-display text-3xl font-semibold">{t.closingHeading}</h2>
        <p className="mx-auto mb-8 max-w-md text-ink/60">{t.closingBody}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark">
            {t.closingGetStarted}
          </Link>
          <Link href="/contact" className="rounded-full border border-black/10 px-8 py-3 font-medium text-ink transition hover:bg-black/5">
            {t.closingContact}
          </Link>
        </div>
        <p className="mt-8 text-sm text-ink/50">
          {t.careersLine}{' '}
          <Link href="/careers" className="text-brand-blue underline">{t.careersLink}</Link>
        </p>
      </section>
    </main>
  );
}
