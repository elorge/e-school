// web/components/marketing/CareersPageContent.tsx
'use client';

import { Mail, Wifi, Users2, Puzzle, MessageSquare, Handshake, Sparkles } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { careersLabelsFor } from '@/lib/i18n/careers-labels';
import { CONTACT_EMAIL } from '@/lib/site';

// TODO: replace with real open roles as they come up. Kept honest and
// empty rather than inventing job postings — a fake listing is a bad
// first impression for anyone who takes it seriously enough to apply.
const OPEN_ROLES: { title: string; type: string }[] = [];

const WHY_ICONS = [Puzzle, Wifi, Users2];
const HIRE_ICONS = [MessageSquare, Handshake, Sparkles];

export default function CareersPageContent() {
  const { locale } = useMarketingLocale();
  const t = careersLabelsFor(locale);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.kicker}</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t.heroTitle}</h1>
        <p className="max-w-xl text-lg text-ink/70">{t.heroBody}</p>
      </section>

      {/* Why Elorge */}
      <section className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.whyHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.whyElorge.map(({ title, body }, i) => {
              const Icon = WHY_ICONS[i];
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

      {/* How we hire */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.hireKicker}</p>
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">{t.hireHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.howWeHire.map(({ title, body }, i) => {
              const Icon = HIRE_ICONS[i];
              return (
                <div key={title} className="pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">
                    {i + 1}. {title}
                  </h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink">{t.openRolesHeading}</h2>
          {OPEN_ROLES.length > 0 ? (
            <div className="mb-10 flex flex-col gap-3">
              {OPEN_ROLES.map((role) => (
                <div key={role.title} className="card flex items-center justify-between">
                  <span className="font-medium">{role.title}</span>
                  <span className="badge badge-blue">{role.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card mb-10">
              <p className="text-sm text-ink/60">{t.noOpenRolesBody}</p>
            </div>
          )}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Interested in joining Elorge`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Mail size={16} /> {t.emailUs}
          </a>
        </div>
      </section>
    </main>
  );
}
