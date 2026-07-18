// web/components/AttemptDetailModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { getAttemptDetail, type AttemptDetail } from '@/lib/endpoints/cbt';
import MathText from './MathText';

export default function AttemptDetailModal({
  school,
  testId,
  attemptId,
  onClose,
}: {
  school: string;
  testId: string;
  attemptId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guards against a stale response landing after the modal has
    // already been reopened for a different attempt — without this, a
    // slow request for attempt A could resolve after a fast request
    // for attempt B and overwrite B's just-rendered detail with A's.
    let cancelled = false;
    setDetail(null);
    setError(null);

    getAttemptDetail(school, testId, attemptId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this attempt — check your connection and try again.');
      });

    return () => {
      cancelled = true;
    };
  }, [school, testId, attemptId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {detail ? `${detail.student.firstName} ${detail.student.lastName}` : error ? 'Could not load attempt' : 'Loading…'}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/40 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {detail?.questions.map((q, i) => (
          <div key={q.id} className="mb-4 rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">
              {i + 1}. <MathText text={q.questionText} />
            </p>

            {q.type === 'OBJECTIVE' ? (
              <div className="flex flex-col gap-1">
                {q.options.map((opt, idx) => {
                  const isSelected = q.selectedOptionIndex === idx;
                  const isCorrectOpt = q.correctOptionIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                        isCorrectOpt ? 'bg-brand-green/10' : isSelected ? 'bg-red-50' : ''
                      }`}
                    >
                      {isCorrectOpt ? (
                        <Check size={14} className="text-brand-green" />
                      ) : isSelected ? (
                        <XCircle size={14} className="text-red-500" />
                      ) : (
                        <span className="w-3.5" />
                      )}
                      <MathText text={opt} />
                      {isSelected && <span className="ml-auto text-xs text-ink/40">Selected</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-ink/50">
                  {q.passedCount}/{q.totalCount} assertions passed
                </p>
                {q.assertionResults && (
                  <div className="flex flex-col gap-1">
                    {q.assertionResults.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {r.passed ? (
                          <Check size={14} className="text-brand-green" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        {r.description}
                      </div>
                    ))}
                  </div>
                )}
                {(q.submittedHtml || q.submittedCss || q.submittedJs) && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <label className="flex flex-col gap-1 text-xs">
                      Submitted HTML
                      <pre className="max-h-32 overflow-auto rounded border bg-black/5 p-2 font-mono text-xs">{q.submittedHtml || '—'}</pre>
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                      Submitted CSS
                      <pre className="max-h-32 overflow-auto rounded border bg-black/5 p-2 font-mono text-xs">{q.submittedCss || '—'}</pre>
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                      Submitted JS
                      <pre className="max-h-32 overflow-auto rounded border bg-black/5 p-2 font-mono text-xs">{q.submittedJs || '—'}</pre>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}