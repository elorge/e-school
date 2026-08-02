// web/components/QuestionsListModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Pencil, Trash2, Check, XCircle } from 'lucide-react';
import { getTest, updateQuestion, deleteQuestion, type CbtQuestionDetail, type CbtTest } from '@/lib/endpoints/cbt';
import MathText from '@/components/MathText';

export default function QuestionsListModal({
  school,
  test,
  onClose,
  onQuestionsChanged,
}: {
  school: string;
  test: CbtTest;
  onClose: () => void;
  onQuestionsChanged: (count: number) => void;
}) {
  const [questions, setQuestions] = useState<CbtQuestionDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editable = test.status === 'DRAFT';

  useEffect(() => {
    getTest(school, test.id)
      .then((t) => setQuestions(t.questions))
      .catch(() => setError('Could not load questions'));
  }, [school, test.id]);

  async function handleDelete(id: string) {
    if (!confirm('Remove this question? This cannot be undone.')) return;
    try {
      await deleteQuestion(school, test.id, id);
      setQuestions((qs) => {
        const next = (qs ?? []).filter((q) => q.id !== id);
        onQuestionsChanged(next.length);
        return next;
      });
    } catch {
      setError('Could not delete question');
    }
  }

  async function handleSave(id: string, patch: Record<string, unknown>) {
    try {
      const updated = await updateQuestion(school, test.id, id, patch);
      setQuestions((qs) => (qs ?? []).map((q) => (q.id === id ? ({ ...q, ...updated } as CbtQuestionDetail) : q)));
      setEditingId(null);
    } catch {
      setError('Could not save question');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">
            Questions in "{test.title}" {questions ? `(${questions.length})` : ''}
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {!editable && (
          <p className="mb-3 rounded bg-amber-50 p-2 text-xs text-amber-800">
            This test is {test.status.toLowerCase()} — questions are locked and shown read-only, since students have
            already been scored against them.
          </p>
        )}

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {!questions && !error && <p className="text-sm text-ink/50">Loading…</p>}
        {questions && questions.length === 0 && <p className="text-sm text-ink/50">No questions added yet.</p>}

        <div className="flex flex-col gap-3">
          {questions?.map((q, i) =>
            editingId === q.id ? (
              <QuestionEditRow
                key={q.id}
                question={q}
                onCancel={() => setEditingId(null)}
                onSave={(patch) => handleSave(q.id, patch)}
              />
            ) : (
              <div key={q.id} className="rounded border p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {i + 1}. <MathText text={q.questionText} />{' '}
                    <span className="text-xs text-ink/40">
                      ({q.points} pt{q.points !== 1 ? 's' : ''})
                    </span>
                  </p>
                  {editable && (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => setEditingId(q.id)} className="text-brand-blue hover:underline" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="text-ink/30 hover:text-red-600" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {q.type === 'OBJECTIVE' ? (
                  <ul className="mt-1 flex flex-col gap-0.5 text-xs text-ink/60">
                    {q.options.map((opt, oi) => (
                      <li key={oi} className={oi === q.correctOptionIndex ? 'font-medium text-brand-green' : ''}>
                        {String.fromCharCode(65 + oi)}) <MathText text={opt} /> {oi === q.correctOptionIndex && '✓'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-ink/40">
                    Code challenge — {(q.testAssertions ?? []).length} test assertion(s)
                  </p>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionEditRow({
  question,
  onSave,
  onCancel,
}: {
  question: CbtQuestionDetail;
  onSave: (patch: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [questionText, setQuestionText] = useState(question.questionText);
  const [points, setPoints] = useState(question.points);
  const [options, setOptions] = useState(question.type === 'OBJECTIVE' ? [...question.options] : []);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(question.type === 'OBJECTIVE' ? question.correctOptionIndex : 0);
  const [starterHtml, setStarterHtml] = useState(question.type === 'CODE' ? question.starterHtml ?? '' : '');
  const [starterCss, setStarterCss] = useState(question.type === 'CODE' ? question.starterCss ?? '' : '');
  const [starterJs, setStarterJs] = useState(question.type === 'CODE' ? question.starterJs ?? '' : '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question.type === 'OBJECTIVE') {
      onSave({ questionText, points, options, correctOptionIndex });
    } else {
      onSave({ questionText, points, starterHtml, starterCss, starterJs });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded border border-brand-blue bg-brand-blue/5 p-3">
      <textarea className="rounded border px-2 py-1.5 text-sm" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />

      {question.type === 'OBJECTIVE' ? (
        options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" checked={correctOptionIndex === i} onChange={() => setCorrectOptionIndex(i)} />
            <input
              className="flex-1 rounded border px-2 py-1 text-sm"
              value={opt}
              onChange={(e) => setOptions((o) => o.map((x, idx) => (idx === i ? e.target.value : x)))}
              required
            />
          </div>
        ))
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          <textarea className="min-h-[70px] rounded border p-2 font-mono text-xs" value={starterHtml} onChange={(e) => setStarterHtml(e.target.value)} placeholder="HTML" />
          <textarea className="min-h-[70px] rounded border p-2 font-mono text-xs" value={starterCss} onChange={(e) => setStarterCss(e.target.value)} placeholder="CSS" />
          <textarea className="min-h-[70px] rounded border p-2 font-mono text-xs" value={starterJs} onChange={(e) => setStarterJs(e.target.value)} placeholder="JS" />
        </div>
      )}

      <label className="flex w-24 flex-col gap-1 text-xs">
        Points
        <input className="rounded border px-2 py-1" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
      </label>

      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-1 rounded bg-brand-green px-3 py-1.5 text-xs text-white">
          <Check size={13} /> Save
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded bg-black/5 px-3 py-1.5 text-xs">
          <XCircle size={13} /> Cancel
        </button>
      </div>
    </form>
  );
}