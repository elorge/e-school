// web/app/terms/page.tsx
'use client';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { termsPageLabelsFor } from '@/lib/i18n/terms-page-labels';

/**
 * Legal boilerplate — the [DATE] placeholder below is intentional and
 * signals this hasn't had a final legal review yet. That applies to
 * BOTH language versions: translating this text made the two versions
 * consistent, but doesn't substitute for a lawyer reviewing the final
 * wording in each language before this goes live for real schools.
 */
export default function TermsPage() {
  const { locale } = useMarketingLocale();
  const t = termsPageLabelsFor(locale);

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
      </main>
      <SiteFooter />
    </>
  );
}
