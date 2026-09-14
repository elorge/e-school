// web/components/ResultEntryModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { getResult, saveResult } from '@/lib/endpoints/results';
import { listForClass } from '@/lib/endpoints/subjects';
import { getSessionUser } from '@/lib/session';
import { useSchool } from '@/lib/school-context';
import { resultEntryLabelsFor } from '@/lib/i18n/result-entry-labels';
import type { Term } from '@/lib/types';

interface Props {
  school: string;
  studentId: string;
  studentName: string;
  classId?: string; // when provided, subject suggestions come from this class's assigned subjects instead of a generic fallback list
  terms: Term[];
  onClose: () => void;
}

const FALLBACK_SUBJECTS = ['Mathematics', 'English Language']; // used only if no classId is passed, or the class has no subjects assigned yet

export default function ResultEntryModal({ school, studentId, studentName, classId, terms, onClose }: Props) {
  const schoolCtx = useSchool();
  const t = resultEntryLabelsFor(schoolCtx.locale);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(FALLBACK_SUBJECTS);

  useEffect(() => {
    if (!classId) return;
    listForClass(school, classId)
      .then((assigned) => {
        if (assigned.length > 0) setSubjectOptions(assigned.map((a) => a.subject.name));
      })
      .catch(() => {
        // Keep the fallback list — a subjects-fetch failure shouldn't block result entry.
      });
  }, [school, classId]);
  const [termId, setTermId] = useState(terms[0]?.id ?? '');
  const [scoreRows, setScoreRows] = useState<{ subject: string; score: number }[]>([{ subject: '', score: 0 }]);
  const [teacherComment, setTeacherComment] = useState('');
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!termId) return;
    setIsLoadingResult(true);
    setNotice(null);
    getResult(school, studentId, termId)
      .then((existing) => {
        if (existing && Object.keys(existing.subjectScores).length > 0) {
          setScoreRows(Object.entries(existing.subjectScores).map(([subject, score]) => ({ subject, score: score as number })));
          setTeacherComment(existing.teacherComment ?? '');
        } else {
          setScoreRows([{ subject: '', score: 0 }]);
          setTeacherComment('');
        }
      })
      .catch(() => {
        setScoreRows([{ subject: '', score: 0 }]);
        setTeacherComment('');
      })
      .finally(() => setIsLoadingResult(false));
  }, [school, studentId, termId]);

  // Escape key closes the modal, matching standard dialog behavior.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function updateRow(index: number, field: 'subject' | 'score', value: string) {
    setScoreRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: field === 'score' ? Number(value) : value } : r)));
  }

  function addRow() {
    setScoreRows((rows) => [...rows, { subject: '', score: 0 }]);
  }

  function removeRow(index: number) {
    setScoreRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    setNotice(null);

    const user = getSessionUser();
    if (!user) {
      setError(t.sessionExpiredError);
      return;
    }
    if (!termId) {
      setError(t.selectTermFirstError);
      return;
    }

    const validRows = scoreRows.filter((r) => r.subject.trim() !== '');
    if (validRows.length === 0) {
      setError(t.addAtLeastOneSubjectError);
      return;
    }
    if (validRows.some((r) => r.score < 0 || r.score > 100)) {
      setError(t.scoresRangeError);
      return;
    }
    const subjectScores: Record<string, number> = {};
    for (const row of validRows) subjectScores[row.subject.trim()] = row.score;

    setIsSaving(true);
    try {
      const outcome = await saveResult(school, studentId, termId, {
        subjectScores,
        teacherComment: teacherComment || undefined,
        classTeacherId: user.id,
      });
      setNotice(outcome.queued ? t.queuedNotice : t.savedNotice);
    } catch {
      setError(t.couldNotSaveError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40">{t.enterResults}</p>
            <h2 className="font-display text-lg font-semibold">{studentName}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/40 hover:bg-black/5 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <label className="mb-4 flex flex-col gap-1 text-sm">
          {t.termLabel}
          <select className="rounded border px-2 py-1.5" value={termId} onChange={(e) => setTermId(e.target.value)}>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </label>

        {isLoadingResult ? (
          <p className="py-8 text-center text-sm text-ink/40">{t.loading}</p>
        ) : (
          <>
            <p className="mb-2 text-sm font-medium">{t.subjectScores}</p>
            <datalist id="modal-subject-suggestions">
              {subjectOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <div className="mb-3 flex flex-col gap-2">
              {scoreRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded border px-2 py-1.5 text-sm"
                    list="modal-subject-suggestions"
                    placeholder={t.subjectPlaceholder}
                    value={row.subject}
                    onChange={(e) => updateRow(i, 'subject', e.target.value)}
                  />
                  <input
                    className="w-20 rounded border px-2 py-1.5 text-center text-sm"
                    type="number"
                    min={0}
                    max={100}
                    value={row.score}
                    onChange={(e) => updateRow(i, 'score', e.target.value)}
                  />
                  <button type="button" onClick={() => removeRow(i)} className="text-ink/30 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="btn-secondary mb-4 flex items-center gap-1.5 text-xs">
              <Plus size={13} /> {t.addSubjectBtn}
            </button>

            <label className="mb-4 flex flex-col gap-1 text-sm">
              {t.teachersCommentLabel}
              <textarea
                className="min-h-[60px] rounded border px-2 py-1.5 text-sm"
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
              />
            </label>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {notice && <p className="mb-3 text-sm text-green-700">{notice}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="btn-secondary">
                {t.closeBtn}
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
                <Save size={15} /> {isSaving ? t.savingBtn : t.saveResultBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
