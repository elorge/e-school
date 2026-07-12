// web/app/[school]/admin/documents/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { listStudents } from '@/lib/endpoints/students';
import { listTerms } from '@/lib/endpoints/terms';
import { fetchReportCardPdf, fetchIdCardPdf, fetchCalendarPdf, openPdfBlob } from '@/lib/endpoints/documents';
import type { Student, Term } from '@/lib/types';

/**
 * One place to pull any printable document — report cards, ID cards,
 * term calendars — instead of hunting through individual student rows
 * or term pages for a download link.
 */
export default function DocumentsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

useEffect(() => {
    Promise.all([listStudents(params.school), listTerms(params.school)])
      .then(([s, t]) => {
        setStudents(s);
        setTerms(t);
      })
      .catch(() => setError('Failed to load students/terms'))
      .finally(() => setIsLoading(false));
  }, [params.school]);

  async function handleDownload(action: string, fetcher: () => Promise<Blob>) {
    setError(null);
    setLoadingAction(action);
    try {
      const blob = await fetcher();
      openPdfBlob(blob);
    } catch {
      setError('Could not generate that document. Check your selection and try again.');
    } finally {
      setLoadingAction(null);
    }
  }

if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Documents</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Student documents</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Student
            <select
              className="min-w-[220px] rounded border px-2 py-1.5"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentId ?? 'pending ID'}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Term
            <select className="rounded border px-2 py-1.5" value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}>
              <option value="">Select a term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={!selectedStudentId || !selectedTermId || loadingAction === 'report'}
            onClick={() => handleDownload('report', () => fetchReportCardPdf(params.school, selectedStudentId, selectedTermId))}
            className="rounded bg-brand-blue px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingAction === 'report' ? 'Generating…' : 'Report card PDF'}
          </button>
          <button
            disabled={!selectedStudentId || loadingAction === 'idcard'}
            onClick={() => handleDownload('idcard', () => fetchIdCardPdf(params.school, selectedStudentId))}
            className="rounded bg-brand-green px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingAction === 'idcard' ? 'Generating…' : 'ID card PDF'}
          </button>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Term documents</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Term
            <select className="min-w-[220px] rounded border px-2 py-1.5" value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}>
              <option value="">Select a term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={!selectedTermId || loadingAction === 'calendar'}
            onClick={() => handleDownload('calendar', () => fetchCalendarPdf(params.school, selectedTermId))}
            className="rounded bg-brand-blue px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingAction === 'calendar' ? 'Generating…' : 'Term calendar PDF'}
          </button>
        </div>
      </section>
    </main>
  );
}