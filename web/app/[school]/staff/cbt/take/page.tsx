// web/app/[school]/staff/cbt/take/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { listTests, startAttempt, type CbtTest } from '@/lib/endpoints/cbt';
import { initLocalAttempt, getLocalAttempt, clearLocalAttempt, retryQueuedSubmit } from '@/lib/cbt-offline';
import CbtSessionRunner from '@/components/CbtSessionRunner';
import type { Class, Student } from '@/lib/types';

export default function TakeCbtPage({ params }: { params: { school: string } }) {
  const [step, setStep] = useState<'setup' | 'in-progress' | 'done'>('setup');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<CbtTest[]>([]);
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [testId, setTestId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listClasses(params.school), listTests(params.school)]).then(([c, t]) => {
      setClasses(c);
      setTests(t.filter((test) => test.status === 'PUBLISHED'));
    });
  }, [params.school]);

  useEffect(() => {
    if (classId) listStudents(params.school, classId).then(setStudents);
  }, [classId, params.school]);

  // Retry a queued (offline) submit whenever connectivity returns.
  useEffect(() => {
    if (!attemptId) return;
    const handleOnline = () => {
      retryQueuedSubmit(attemptId);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [attemptId]);

  async function handleStart() {
    setError(null);
    try {
      const session = await startAttempt(params.school, testId, studentId);
      const local = initLocalAttempt(params.school, session);
      setAttemptId(local.attemptId);
      setStep('in-progress');
    } catch {
      setError('Could not start this test — check the test is published and this student is assigned to it.');
    }
  }

  if (step === 'setup') {
    return (
      <main className="mx-auto max-w-md">
        <h1 className="mb-4 text-xl font-semibold">Start a CBT session</h1>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex flex-col gap-3">
          <select className="rounded border px-3 py-2" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="rounded border px-3 py-2" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          <select className="rounded border px-3 py-2" value={testId} onChange={(e) => setTestId(e.target.value)}>
            <option value="">Select test</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — {t.subject}
              </option>
            ))}
          </select>
          <button
            disabled={!classId || !studentId || !testId}
            onClick={handleStart}
            className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50"
          >
            Begin test
          </button>
        </div>
      </main>
    );
  }

  if (step === 'in-progress') {
    const local = getLocalAttempt(attemptId!);
    if (!local) return null;
    return <CbtSessionRunner session={{ attemptId: local.attemptId, deadlineAt: local.deadlineAt, questions: local.questions, savedAnswers: local.answers }} />;
  }

  return (
    <main className="mx-auto max-w-md text-center">
      <h1 className="mb-2 text-xl font-semibold">Session ended</h1>
      {attemptId && (
        <button onClick={() => clearLocalAttempt(attemptId)} className="mt-6 text-sm text-ink/50 underline">
          Start another session
        </button>
      )}
    </main>
  );
}