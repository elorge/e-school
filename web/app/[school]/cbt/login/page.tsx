// web/app/[school]/cbt/login/page.tsx
'use client';

import { useState } from 'react';
import { studentLogin } from '@/lib/endpoints/cbt';
import { initLocalAttempt } from '@/lib/cbt-offline';
import { ApiError } from '@/lib/api';
import { apiErrorMessage } from '@/lib/i18n/error-messages';
import { useSchool } from '@/lib/school-context';
import { cbtLabelsFor } from '@/lib/i18n/cbt-labels';
import CbtSessionRunner from '@/components/CbtSessionRunner';
import type { AttemptSession } from '@/lib/endpoints/cbt';

/** Public — a student sits at any lab computer and self-authenticates. No staff login required. */
export default function StudentCbtLoginPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = cbtLabelsFor(school.locale);
  const [admissionId, setAdmissionId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [session, setSession] = useState<AttemptSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await studentLogin(params.school, accessCode, admissionId);
      initLocalAttempt(params.school, result);
      setSession(result);
    } catch (err) {
      // Backend errors on this public flow now carry a machine-readable
      // code (invalid access code, admission ID not recognized, wrong
      // day, etc.) that apiErrorMessage translates — see error-messages.ts.
      setError(apiErrorMessage(err, school.locale, t.loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (session) return <CbtSessionRunner session={session} />;

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-xl font-semibold">{t.loginTitle}</h1>
      <p className="mb-6 text-sm text-ink/60">{t.loginSubtitle}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t.admissionIdLabel}
          <input className="rounded border px-3 py-2" value={admissionId} onChange={(e) => setAdmissionId(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t.accessCodeLabel}
          <input className="rounded border px-3 py-2" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? t.startingTest : t.beginTest}
        </button>
      </form>
    </main>
  );
}