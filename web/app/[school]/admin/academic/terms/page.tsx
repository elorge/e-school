// web/app/[school]/admin/academic/terms/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listTerms, createTerm } from '@/lib/endpoints/terms';
import type { Term } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';

export default function TermsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    academicSession: '',
    periodLabel: 'Term', // "Term", "Semester", "Quarter", "Trimester" — whatever this school's system calls it
    termNumber: 1,
    startDate: '',
    endDate: '',
  });

  async function load() {
    try {
      setTerms(await listTerms(params.school));
    } catch {
      setError('Failed to load terms');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const name = `${form.academicSession} — ${form.periodLabel} ${form.termNumber}`;
      await createTerm(params.school, {
        name,
        academicSession: form.academicSession,
        termNumber: form.termNumber,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setForm((f) => ({ ...f, academicSession: '', termNumber: 1, startDate: '', endDate: '' }));
      load();
    } catch (err: any) {
      setError(err?.message ?? "Could not create term — check the session/number isn't already used");
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Terms</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="card">
        <h2 className="mb-3 font-medium">Create a term</h2>
        <p className="mb-3 text-xs text-ink/50">
          Academic session groups every period together — e.g. "2025/2026" — and is what powers Session Wrap.
          Whatever your school calls its periods (Term, Semester, Quarter, Trimester) and however many you run per
          session, this works — the number just needs to be unique within one session.
        </p>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Academic session
            <input
              className="rounded border px-2 py-1.5"
              placeholder="2025/2026"
              value={form.academicSession}
              onChange={(e) => setForm((f) => ({ ...f, academicSession: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            What you call a period
            <input
              className="w-32 rounded border px-2 py-1.5"
              placeholder="Term"
              value={form.periodLabel}
              onChange={(e) => setForm((f) => ({ ...f, periodLabel: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Number
            <input
              className="w-20 rounded border px-2 py-1.5"
              type="number"
              min={1}
              max={6}
              value={form.termNumber}
              onChange={(e) => setForm((f) => ({ ...f, termNumber: Number(e.target.value) }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Start date
            <input
              className="rounded border px-2 py-1.5"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            End date
            <input
              className="rounded border px-2 py-1.5"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            Create {form.periodLabel || 'term'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">All terms</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {terms.map((t) => (
            <li key={t.id}>
              {t.name} — {t.startDate.slice(0, 10)} to {t.endDate.slice(0, 10)}
            </li>
          ))}
        </ul>
      </section>
    </main>
    </RequireRole>
  );
}