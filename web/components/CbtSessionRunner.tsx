// web/components/CbtSessionRunner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { answerQuestion, submitLocalAttempt, retryQueuedSubmit, clearLocalAttempt, getLocalAttempt } from '@/lib/cbt-offline';
import type { AttemptSession } from '@/lib/endpoints/cbt';
import MathText from './MathText';

function formatCountdown(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Shared quiz-taking UI — used by both the staff-assisted flow and the student self-service flow. Assumes initLocalAttempt() was already called by the caller. */
export default function CbtSessionRunner({ session }: { session: AttemptSession }) {
  const [answers, setAnswers] = useState<Record<string, number>>(session.savedAnswers);
  const [msRemaining, setMsRemaining] = useState(0);
  const [done, setDone] = useState(false);
  const [queued, setQueued] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const remaining = new Date(session.deadlineAt).getTime() - Date.now();
      setMsRemaining(remaining);
      if (remaining <= 0 && !submittedRef.current) handleSubmit();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      const ok = await retryQueuedSubmit(session.attemptId);
      if (ok) setQueued(false);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [session.attemptId]);

  function handleSelectOption(questionId: string, index: number) {
    setAnswers((a) => ({ ...a, [questionId]: index }));
    answerQuestion(session.attemptId, questionId, index);
  }

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const result = await submitLocalAttempt(session.attemptId);
    setQueued(result.queued);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-2 text-xl font-semibold">Test submitted</h1>
        {queued ? (
          <p className="text-sm text-amber-700">
            No internet right now — your submission is saved on this device and will finish syncing automatically.
            Please don't close this tab yet.
          </p>
        ) : (
          <p className="text-sm text-green-700">Successfully submitted.</p>
        )}
      </div>
    );
  }

  const isLowTime = msRemaining < 60_000;
  return (
    <div className="mx-auto max-w-2xl">
      <div className={`sticky top-0 z-10 mb-6 flex items-center justify-between rounded-lg px-4 py-2 ${isLowTime ? 'bg-red-100' : 'bg-black/5'}`}>
        <span className="text-sm">Answer every question, then submit.</span>
        <span className={`font-mono text-lg font-semibold ${isLowTime ? 'text-red-700' : ''}`}>{formatCountdown(msRemaining)}</span>
      </div>
      <div className="flex flex-col gap-6">
        {session.questions.map((q, idx) => (
          <div key={q.id} className="card">
            <p className="mb-3 font-medium">
              {idx + 1}. <MathText text={q.questionText} />
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name={q.id} checked={answers[q.id] === optIdx} onChange={() => handleSelectOption(q.id, optIdx)} />
                  <MathText text={opt} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="mt-6 w-full rounded bg-brand-green px-4 py-3 font-medium text-white">
        Submit test
      </button>
    </div>
  );
}