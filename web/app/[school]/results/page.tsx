// web/app/[school]/results/page.tsx
'use client';

import { useState } from 'react';
import { lookupResult } from '@/lib/endpoints/pins';
import { ApiError } from '@/lib/api';

interface LookupResult {
  subjectScores: Record<string, number>;
  teacherComment: string | null;
}

/**
 * Student-facing PIN portal. Deliberately public — the backend marks
 * this route @Public(), so no login token is needed or sent here.
 */
export default function ResultsPage({ params }: { params: { school: string } }) {
  const [admissionId, setAdmissionId] = useState('');
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const data = (await lookupResult(params.school, admissionId, pin)) as LookupResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Check your result</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Admission ID
          <input className="rounded border px-3 py-2" value={admissionId} onChange={(e) => setAdmissionId(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          PIN
          <input className="rounded border px-3 py-2" value={pin} onChange={(e) => setPin(e.target.value)} type="password" required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? 'Checking…' : 'View result'}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded border p-4">
          <h2 className="mb-2 font-medium">Subject scores</h2>
          <ul className="mb-3 text-sm">
            {Object.entries(result.subjectScores).map(([subject, score]) => (
              <li key={subject}>
                {subject}: {score}
              </li>
            ))}
          </ul>
          {result.teacherComment && <p className="text-sm italic">"{result.teacherComment}"</p>}
        </div>
      )}
    </main>
  );
}