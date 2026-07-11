// web/app/[school]/staff/cbt/take/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { listTests, startAttempt, type CbtTest } from '@/lib/endpoints/cbt';
import {
  initLocalAttempt,
  getLocalAttempt,
  answerQuestion,
  submitLocalAttempt,
  retryQueuedSubmit,
  clearLocalAttempt,
} from '@/lib/cbt-offline';
import type { Class, Student } from '@/lib/types';

function formatCountdown(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function TakeCbtPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [step, setStep] = useState<'setup' | 'in-progress' | 'done'>('setup');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<CbtTest[]>([]);
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [testId, setTestId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ id: string; questionText: string; options: string[]; points: number }[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [deadlineAt, setDeadlineAt] = useState<string | null>(null);
  const [msRemaining, setMsRemaining] = useState(0);
  const [submitResult, setSubmitResult] = useState<{ queued: boolean } | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    Promise.all([listClasses(params.school), listTests(params.school)]).then(([c, t]) => {
      setClasses(c);
      setTests(t.filter((test) => test.status === 'PUBLISHED'));
    });
  }, [params.school]);

  useEffect(() => {
    if (classId) listStudents(params.school, classId).then(setStudents);
  }, [classId, params.school]);

  // Countdown ticker — recomputes from deadlineAt every second, so it
  // stays correct even if this device was offline for a stretch.
  useEffect(() => {
    if (!deadlineAt || step !== 'in-progress') return;
    const tick = () => {
      const remaining = new Date(deadlineAt).getTime() - Date.now();
      setMsRemaining(remaining);
      if (remaining <= 0 && !submittedRef.current) {
        handleSubmit(); // time's up — auto-submit
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineAt, step]);

  // Retry a queued (offline) submit whenever connectivity returns.
  useEffect(() => {
    if (!attemptId) return;
    const handleOnline = async () => {
      const ok = await retryQueuedSubmit(attemptId);
      if (ok) setSubmitResult({ queued: false });
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
      setQuestions(local.questions);
      setAnswers(local.answers);
      setDeadlineAt(local.deadlineAt);
      setStep('in-progress');
    } catch {
      setError('Could not start this test — check the test is published and this student is assigned to it.');
    }
  }

  function handleSelectOption(questionId: string, index: number) {
    if (!attemptId) return;
    setAnswers((a) => ({ ...a, [questionId]: index }));
    answerQuestion(attemptId, questionId, index); // fire-and-forget, offline-safe (see lib/cbt-offline.ts)
  }

  async function handleSubmit() {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    const result = await submitLocalAttempt(attemptId);
    setSubmitResult({ queued: result.queued });
    setStep('done');
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
    const isLowTime = msRemaining < 60_000;
    return (
      <main className="mx-auto max-w-2xl">
        <div className={`sticky top-0 z-10 mb-6 flex items-center justify-between rounded-lg px-4 py-2 ${isLowTime ? 'bg-red-100' : 'bg-black/5'}`}>
          <span className="text-sm">Answer every question, then submit.</span>
          <span className={`font-mono text-lg font-semibold ${isLowTime ? 'text-red-700' : ''}`}>{formatCountdown(msRemaining)}</span>
        </div>
        <div className="flex flex-col gap-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border p-4">
              <p className="mb-3 font-medium">
                {idx + 1}. {q.questionText}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === optIdx}
                      onChange={() => handleSelectOption(q.id, optIdx)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} className="mt-6 w-full rounded bg-brand-green px-4 py-3 font-medium text-white">
          Submit test
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md text-center">
      <h1 className="mb-2 text-xl font-semibold">Test submitted</h1>
      {submitResult?.queued ? (
        <p className="text-sm text-amber-700">
          No internet right now — the submission is saved on this device and will finish syncing automatically once
          you're back online. Do not close this tab until it syncs.
        </p>
      ) : (
        <p className="text-sm text-green-700">Successfully submitted and graded (objectives).</p>
      )}
      {attemptId && (
        <button onClick={() => clearLocalAttempt(attemptId)} className="mt-6 text-sm text-ink/50 underline">
          Start another session
        </button>
      )}
    </main>
  );
}