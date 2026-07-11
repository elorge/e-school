// web/app/[school]/session-wrap/page.tsx
'use client';

import { useState } from 'react';
import { publicSessionWrapLookup, type SessionWrap } from '@/lib/endpoints/insights';
import { ApiError } from '@/lib/api';
import SessionWrapCard from '@/components/SessionWrapCard';

/**
 * Uses the PIN from the session's final (3rd) term as the credential —
 * parents already have this from the normal result-PIN handout.
 */
export default function PublicSessionWrapPage({ params }: { params: { school: string } }) {
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
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-xl font-semibold">Your child's Session Wrap</h1>
      <p className="mb-6 text-sm text-ink/60">
        Use your child's current result PIN — you'll see every term on file so far this session, even if it's just
        one.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Admission ID
          <input className="rounded border px-3 py-2" value={admissionId} onChange={(e) => setAdmissionId(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          PIN
          <input className="rounded border px-3 py-2" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? 'Checking…' : 'View Session Wrap'}
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