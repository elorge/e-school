// web/app/[school]/session-wrap/page.tsx
'use client';

import { useState } from 'react';
import { publicSessionWrapLookup, type SessionWrap } from '@/lib/endpoints/insights';
import { ApiError } from '@/lib/api';
import { useSchool } from '@/lib/school-context';
import { sessionWrapLabelsFor } from '@/lib/i18n/session-wrap-labels';
import { apiErrorMessage } from '@/lib/i18n/error-messages';
import SessionWrapCard from '@/components/SessionWrapCard';

/**
 * Uses the PIN from the session's final (3rd) term as the credential —
 * parents already have this from the normal result-PIN handout.
 */
export default function PublicSessionWrapPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = sessionWrapLabelsFor(school.locale);
  const [admissionId, setAdmissionId] = useState('');
  const [pin, setPin] = useState('');
  const [wrap, setWrap] = useState<SessionWrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWrap(null);
    setIsSubmitting(true);
    try {
      const data = await publicSessionWrapLookup(params.school, admissionId, pin);
      setWrap(data);
    } catch (err) {
      setError(apiErrorMessage(err, school.locale, t.genericError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-xl font-semibold">{t.yourChildsSessionWrap}</h1>
      <p className="mb-6 text-sm text-ink/60">{t.publicIntro}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t.admissionIdLabel}
          <input className="rounded border px-3 py-2" value={admissionId} onChange={(e) => setAdmissionId(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t.pinLabel}
          <input className="rounded border px-3 py-2" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? t.checking : t.viewSessionWrap}
        </button>
      </form>

      {wrap && (
        <div className="mt-8">
          <SessionWrapCard wrap={wrap} />
        </div>
      )}
    </main>
  );
}
