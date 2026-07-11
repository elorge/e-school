// web/app/[school]/staff/session-wrap/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listStudents } from '@/lib/endpoints/students';
import { listSessions } from '@/lib/endpoints/terms';
import { getSessionWrap, fetchSessionWrapPdf, type SessionWrap } from '@/lib/endpoints/insights';
import { openPdfBlob } from '@/lib/endpoints/documents';
import SessionWrapCard from '@/components/SessionWrapCard';
import type { Student } from '@/lib/types';

export default function StaffSessionWrapPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [studentId, setStudentId] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [wrap, setWrap] = useState<SessionWrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    listStudents(params.school).then(setStudents).catch(() => setError('Failed to load students'));
    listSessions(params.school).then(setSessions).catch(() => setError('Failed to load sessions'));
  }, [params.school]);

  async function handleGenerate() {
    setError(null);
    setIsLoading(true);
    setWrap(null);
    try {
      const data = await getSessionWrap(params.school, studentId, academicSession);
      setWrap(data);
    } catch {
      setError('No results found for this student in that session yet.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPdf() {
    const blob = await fetchSessionWrapPdf(params.school, studentId, academicSession);
    openPdfBlob(blob);
  }

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{school.name} — Session Wrap</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Student
          <select className="min-w-[200px] rounded border px-2 py-1.5" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select a student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Academic session
          <select className="rounded border px-2 py-1.5" value={academicSession} onChange={(e) => setAcademicSession(e.target.value)}>
            <option value="">Select a session</option>
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
          {isLoading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {wrap && (
        <div className="flex flex-col items-center gap-4">
          <SessionWrapCard wrap={wrap} />
          <button onClick={handleDownloadPdf} className="text-sm text-brand-blue underline">
            Download as PDF
          </button>
        </div>
      )}
    </main>
  );
}