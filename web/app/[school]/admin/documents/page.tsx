// web/app/[school]/admin/documents/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { FileText } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import { listStudents } from '@/lib/endpoints/students';
import { listTerms } from '@/lib/endpoints/terms';
import { fetchReportCardPdf, fetchIdCardPdf, fetchCalendarPdf, issueIdCard, openPdfBlob } from '@/lib/endpoints/documents';
import { documentsLabelsFor } from '@/lib/i18n/documents-labels';
import type { Student, Term } from '@/lib/types';
import RequireRole from '@/components/RequireRole';

/**
 * One place to pull any printable document — report cards, ID cards,
 * term calendars — instead of hunting through individual student rows
 * or term pages for a download link.
 */
export default function DocumentsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = documentsLabelsFor(school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listStudents(params.school), listTerms(params.school)])
      .then(([s, terms]) => {
        setStudents(s);
        setTerms(terms);
      })
      .catch(() => setError(t.loadFailed))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.school]);

  async function handleDownload(action: string, fetcher: () => Promise<Blob>) {
    setError(null);
    setLoadingAction(action);
    try {
      const blob = await fetcher();
      openPdfBlob(blob);
    } catch {
      setError(t.genericDownloadError);
    } finally {
      setLoadingAction(null);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold"><FileText size={20} />{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="card">
        <h2 className="mb-3 font-medium">{t.studentDocumentsHeading}</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t.studentLabel}
            <select
              className="min-w-[220px] rounded border px-2 py-1.5"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">{t.selectStudent}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.studentId ?? t.pendingId}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.termLabel}
            <select className="rounded border px-2 py-1.5" value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}>
              <option value="">{t.selectTerm}</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={!selectedStudentId}
            onClick={async () => {
              setError(null);
              try {
                await issueIdCard(params.school, selectedStudentId);
              } catch {
                setError(t.couldNotIssueIdCard);
              }
            }}
            className="btn-secondary"
          >
            {t.issueIdCardBtn}
          </button>
          <button
            disabled={!selectedStudentId || loadingAction === 'idcard'}
            onClick={() =>
              handleDownload('idcard', () => fetchIdCardPdf(params.school, selectedStudentId)).catch(() =>
                setError(t.noIdCardYetError),
              )
            }
            className="rounded bg-brand-green px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingAction === 'idcard' ? t.generating : t.idCardPdfBtn}
          </button>
          <button
            disabled={!selectedStudentId || !selectedTermId || loadingAction === 'reportcard'}
            onClick={() => handleDownload('reportcard', () => fetchReportCardPdf(params.school, selectedStudentId, selectedTermId))}
            className="rounded bg-brand-blue px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingAction === 'reportcard' ? t.generating : t.reportCardPdfBtn}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">{t.termDocumentsHeading}</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t.termLabel}
            <select className="min-w-[220px] rounded border px-2 py-1.5" value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}>
              <option value="">{t.selectTerm}</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={!selectedTermId || loadingAction === 'calendar'}
            onClick={() => handleDownload('calendar', () => fetchCalendarPdf(params.school, selectedTermId))}
            className="rounded bg-brand-blue px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingAction === 'calendar' ? t.generating : t.termCalendarPdfBtn}
          </button>
        </div>
      </section>
    </main>
    </RequireRole>
  );
}
