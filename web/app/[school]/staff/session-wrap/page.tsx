// web/app/[school]/staff/session-wrap/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { listStudents } from '@/lib/endpoints/students';
import { listSessions } from '@/lib/endpoints/terms';
import { getSessionWrap, fetchSessionWrapPdf, type SessionWrap } from '@/lib/endpoints/insights';
import { openPdfBlob } from '@/lib/endpoints/documents';
import SessionWrapCard from '@/components/SessionWrapCard';
import { sessionWrapLabelsFor } from '@/lib/i18n/session-wrap-labels';
import type { Student } from '@/lib/types';

export default function StaffSessionWrapPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = sessionWrapLabelsFor(school.locale);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [studentId, setStudentId] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [wrap, setWrap] = useState<SessionWrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Promise.all([listStudents(params.school), listSessions(params.school)])
      .then(([s, sess]) => {
        setStudents(s);
        setSessions(sess);
      })
      .catch(() => setError(t.loadFailed))
      .finally(() => setIsPageLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.school]);

  async function handleGenerate() {
    setError(null);
    setIsLoading(true);
    setWrap(null);
    try {
      const data = await getSessionWrap(params.school, studentId, academicSession);
      setWrap(data);
    } catch {
      setError(t.noResultsFound);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPdf() {
    const blob = await fetchSessionWrapPdf(params.school, studentId, academicSession);
    openPdfBlob(blob);
  }

  if (isPageLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t.studentLabel}
          <select className="min-w-[200px] rounded border px-2 py-1.5" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">{t.selectStudent}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t.academicSessionLabel}
          <select className="rounded border px-2 py-1.5" value={academicSession} onChange={(e) => setAcademicSession(e.target.value)}>
            <option value="">{t.selectSession}</option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={!studentId || !academicSession || isLoading}
          onClick={handleGenerate}
          className="rounded bg-brand-blue px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isLoading ? t.generating : t.generate}
        </button>
      </div>

      {wrap && (
        <div className="flex flex-col items-center gap-4">
          <SessionWrapCard wrap={wrap} />
          <button onClick={handleDownloadPdf} className="text-sm text-brand-blue underline">
            {t.downloadAsPdf}
          </button>
        </div>
      )}
    </main>
  );
}
