// web/app/[school]/admin/academic/terms/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listTerms, createTerm } from '@/lib/endpoints/terms';
import type { Term } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';

export default function TermsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    academicSession: '',
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
      const name = `${form.academicSession} — Term ${form.termNumber}`;
      await createTerm(params.school, { name, ...form });
      setForm({ academicSession: '', termNumber: 1, startDate: '', endDate: '' });
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Could not create term — check the session/term number isn\'t already used');
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Terms</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="card">
        <h2 className="mb-3 font-medium">Create a term</h2>
        <p className="mb-3 text-xs text-ink/50">
          Academic session groups Term 1, 2, and 3 together — e.g. "2025/2026" — and is what powers Session Wrap.
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
            Term number
            <select
              className="rounded border px-2 py-1.5"
              value={form.termNumber}
              onChange={(e) => setForm((f) => ({ ...f, termNumber: Number(e.target.value) }))}
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
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
            Create term
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
  );
}