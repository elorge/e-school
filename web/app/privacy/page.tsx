// web/app/privacy/page.tsx
'use client';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { privacyPageLabelsFor } from '@/lib/i18n/privacy-page-labels';
import { CONTACT_EMAIL } from '@/lib/site';

/**
 * Legal boilerplate — same note as terms/page.tsx: the [DATE] placeholder
 * signals this awaits final legal review in both languages before going
 * live for real schools, particularly given the NDPA-specific claims in
 * section 2 that a lawyer should confirm still read correctly once
 * translated.
 */
export default function PrivacyPage() {
  const { locale } = useMarketingLocale();
  const t = privacyPageLabelsFor(locale);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 text-sm text-ink/80">
        <h1 className="mb-2 font-display text-3xl font-semibold text-ink">{t.title}</h1>
        <p className="mb-8 text-xs text-ink/50">{t.lastUpdated}</p>

        {t.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">{s.heading}</h2>
            <p className="mb-4">{s.body}</p>
          </div>
        ))}

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">{t.contactHeading}</h2>
        <p>
          {t.contactPrefix} <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-blue underline">{CONTACT_EMAIL}</a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
