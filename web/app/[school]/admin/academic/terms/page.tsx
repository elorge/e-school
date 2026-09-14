// web/app/[school]/admin/academic/terms/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listTerms, createTerm } from '@/lib/endpoints/terms';
import { termsLabelsFor } from '@/lib/i18n/terms-labels';
import type { Term } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';

export default function TermsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = termsLabelsFor(school.locale);
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
      setError(t.loadFailed);
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
      setError(t.createError);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="card">
        <h2 className="mb-3 font-medium">{t.createHeading}</h2>
        <p className="mb-3 text-xs text-ink/50">{t.createHelp}</p>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            {t.academicSessionLabel}
            <input
              className="rounded border px-2 py-1.5"
              placeholder="2025/2026"
              value={form.academicSession}
              onChange={(e) => setForm((f) => ({ ...f, academicSession: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.periodLabelLabel}
            <input
              className="w-32 rounded border px-2 py-1.5"
              placeholder="Term"
              value={form.periodLabel}
              onChange={(e) => setForm((f) => ({ ...f, periodLabel: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.numberLabel}
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
            {t.startDateLabel}
            <input
              className="rounded border px-2 py-1.5"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.endDateLabel}
            <input
              className="rounded border px-2 py-1.5"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            {t.createBtn(form.periodLabel)}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">{t.allTermsHeading}</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {terms.map((term) => (
            <li key={term.id}>
              {term.name} — {term.startDate.slice(0, 10)} to {term.endDate.slice(0, 10)}
            </li>
          ))}
        </ul>
      </section>
    </main>
    </RequireRole>
  );
}
