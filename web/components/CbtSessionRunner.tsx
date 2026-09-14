// web/components/CbtSessionRunner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { answerQuestion, submitLocalAttempt, retryQueuedSubmit } from '@/lib/cbt-offline';
import { useSchool } from '@/lib/school-context';
import { cbtLabelsFor } from '@/lib/i18n/cbt-labels';
import type { AttemptSession, SavedCodeAnswer } from '@/lib/endpoints/cbt';
import MathText from './MathText';
import CodeQuestionRunner from './CodeQuestionRunner';

function formatCountdown(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Stored per-question answer: a plain option index for OBJECTIVE questions,
// or a SavedCodeAnswer for CODE questions (see CodeQuestionRunner's onResult).
type AnswerMap = Record<string, number | SavedCodeAnswer>;

function isObjectiveAnswer(value: unknown): value is number {
  return typeof value === 'number';
}

interface CbtSessionRunnerProps {
  session: AttemptSession;
  /** Shown as the small breadcrumb line in the header, e.g. the test's subject — "CSE270" */
  courseCode?: string;
  /** Shown as the bold line under the breadcrumb, e.g. the test's title — "W07 Final Exam" */
  quizTitle?: string;
  /** Instructions bullets. Sensible defaults are used if omitted. */
  purpose?: string;
  conditions?: string;
  /** When the attempt began — defaults to "now" if omitted (only affects the "Started:" display). */
  startedAt?: string;
}

/**
 * Shared quiz-taking UI — used by both the staff-assisted flow and the
 * student self-service flow. Assumes initLocalAttempt() was already
 * called by the caller. Styled to match a Canvas-style quiz player: a
 * blue app header with a collapsible instructions panel, then one
 * bordered card per question with a light "Question N / pts" header
 * row above the body.
 */
export default function CbtSessionRunner({
  session,
  courseCode = 'CBT',
  quizTitle = 'Test',
  purpose,
  conditions,
  startedAt,
}: CbtSessionRunnerProps) {
  const [answers, setAnswers] = useState<AnswerMap>(session.savedAnswers);
  const [msRemaining, setMsRemaining] = useState(0);
  const [done, setDone] = useState(false);
  const [queued, setQueued] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const submittedRef = useRef(false);
  const started = useRef(new Date(startedAt ?? Date.now())).current;
  const school = useSchool();
  const t = cbtLabelsFor(school.locale);

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

  // CODE questions report a SavedCodeAnswer rather than a single value —
  // see CodeQuestionRunner's onResult prop. Stored as-is so submitAttempt
  // on the backend can read passedCount/totalCount straight off it.
  function handleCodeResult(questionId: string, result: SavedCodeAnswer) {
    setAnswers((a) => ({ ...a, [questionId]: result }));
    answerQuestion(session.attemptId, questionId, result);
  }

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const result = await submitLocalAttempt(session.attemptId);
    setQueued(result.queued);
    setDone(true);
  }

  const answeredCount = session.questions.filter((q) => answers[q.id] !== undefined).length;
  const isLowTime = msRemaining < 60_000;

  const Header = (
    <>
      <div className="h-1.5 bg-[#0B1F33]" />
      <header className="sticky top-0 z-20 bg-[#137CBD] text-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button className="rounded p-1 text-white/90 hover:bg-white/10" aria-label={t.toggleMenu}>
            <Menu size={22} />
          </button>
          <div className="text-center leading-tight">
            <p className="text-sm font-medium">{courseCode}</p>
            <p className="text-base font-semibold">{quizTitle}</p>
          </div>
          {done ? (
            <span className="w-[22px]" />
          ) : (
            <button
              className="rounded p-1 text-white/90 hover:bg-white/10"
              onClick={() => setInstructionsOpen((o) => !o)}
              aria-label={t.toggleInstructions}
            >
              <ChevronDown size={20} className={`transition-transform ${instructionsOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </header>
    </>
  );

  if (done) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        {Header}
        <main className="mx-auto max-w-3xl px-4 pt-16 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#2D3B45]">{t.testSubmitted}</h1>
          {queued ? (
            <p className="text-sm text-amber-700">{t.submittedOffline}</p>
          ) : (
            <p className="text-sm text-green-700">{t.submittedOnline}</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {Header}

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-6">
        <h1 className="mb-1 text-2xl font-bold text-[#2D3B45]">{quizTitle}</h1>
        <p className="mb-5 text-sm text-[#6B7780]">
          {t.startedAt} {started.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {t.at}{' '}
          {started.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </p>

        {instructionsOpen && (
          <section className="mb-6">
            <h2 className="mb-2 text-xl font-bold text-[#2D3B45]">{t.quizInstructions}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-[#2D3B45]">
              <li>
                <span className="font-semibold">{t.purposeLabel}</span>{' '}
                {purpose ?? t.defaultPurpose(session.questions.length)}
              </li>
              <li>
                <span className="font-semibold">{t.conditionsLabel}</span>{' '}
                {conditions ?? t.defaultConditions}
              </li>
            </ul>
          </section>
        )}

        <hr className="mb-6 border-[#C7CDD1]" />

        <div className="flex flex-col gap-4">
          {session.questions.map((q, idx) =>
            q.type === 'CODE' ? (
              <div key={q.id} className="overflow-hidden rounded border border-[#C7CDD1] bg-white">
                <div className="flex items-center justify-between border-b border-[#C7CDD1] bg-[#F5F5F5] px-4 py-2.5">
                  <p className="font-semibold text-[#2D3B45]">{t.question} {idx + 1}</p>
                  <p className="text-sm text-[#6B7780]">
                    {q.points} {q.points !== 1 ? t.points : t.point}
                  </p>
                </div>
                <div className="px-4 py-4">
                  <CodeQuestionRunner
                    question={q}
                    savedResult={answers[q.id]}
                    onResult={(result) => handleCodeResult(q.id, result)}
                  />
                </div>
              </div>
            ) : (
              <div key={q.id} className="overflow-hidden rounded border border-[#C7CDD1] bg-white">
                <div className="flex items-center justify-between border-b border-[#C7CDD1] bg-[#F5F5F5] px-4 py-2.5">
                  <p className="font-semibold text-[#2D3B45]">{t.question} {idx + 1}</p>
                  <p className="text-sm text-[#6B7780]">
                    {q.points} {q.points !== 1 ? t.points : t.point}
                  </p>
                </div>
                <div className="px-4 py-4">
                  <p className="mb-4 text-[#2D3B45]">
                    <MathText text={q.questionText} />
                  </p>
                  <div className="flex flex-col gap-1">
                    {q.options.map((opt, optIdx) => {
                      const selected = isObjectiveAnswer(answers[q.id]) && answers[q.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          className={`flex cursor-pointer items-center gap-3 rounded border px-3 py-2.5 text-sm transition-colors ${
                            selected ? 'border-[#137CBD] bg-[#137CBD]/5' : 'border-transparent hover:bg-black/[0.03]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={selected}
                            onChange={() => handleSelectOption(q.id, optIdx)}
                            className="h-4 w-4 accent-[#137CBD]"
                          />
                          <MathText text={opt} />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#C7CDD1] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="text-sm text-[#2D3B45]">
            <span className="font-semibold">{answeredCount}</span> / {session.questions.length} {t.answered}
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-sm ${isLowTime ? 'text-red-600' : 'text-[#6B7780]'}`}>
              {formatCountdown(msRemaining)} {t.left}
            </span>
            <button
              onClick={handleSubmit}
              className="rounded bg-[#137CBD] px-5 py-2 text-sm font-medium text-white"
            >
              {t.submitQuiz}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}