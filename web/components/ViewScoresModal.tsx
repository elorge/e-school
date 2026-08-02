// web/components/ViewScoresModal.tsx
'use client';
import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { listAttempts, gradeTheory, downloadAttemptsExcel, type CbtAttemptSummary, type CbtTest } from '@/lib/endpoints/cbt';

export default function ViewScoresModal({
  school,
  test,
  onClose,
  onViewAttempt,
}: {
  school: string;
  test: CbtTest;
  onClose: () => void;
  onViewAttempt: (attemptId: string) => void;
}) {
  const [attempts, setAttempts] = useState<CbtAttemptSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAttempts(school, test.id).then(setAttempts).catch(() => setError('Could not load scores'));
  }, [school, test.id]);

  async function handleGradeTheory(attemptId: string, value: string) {
    await gradeTheory(school, attemptId, Number(value));
    listAttempts(school, test.id).then(setAttempts);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Scores — {test.title}</h3>
          <div className="flex items-center gap-3">
            {attempts && (
              <button
                onClick={async () => {
                  const blob = await downloadAttemptsExcel(school, test.id);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cbt-attempts.xlsx';
                  a.click();
                }}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Download size={13} /> Export to Excel
              </button>
            )}
            <button onClick={onClose} className="text-ink/40 hover:text-ink"><X size={18} /></button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!attempts && !error && <p className="text-sm text-ink/50">Loading…</p>}

        {attempts && (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-black/5 text-xs text-ink/50">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Objective</th>
                  {test.theoryMaxScore > 0 && <th className="px-3 py-2 text-right">Theory</th>}
                  <th className="px-3 py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-3 py-2">{a.student.firstName} {a.student.lastName}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`badge ${a.status === 'GRADED' ? 'badge-green' : a.status === 'SUBMITTED' ? 'badge-amber' : 'badge-gray'}`}>
                        {a.status === 'IN_PROGRESS' ? 'In progress' : a.status === 'SUBMITTED' ? 'Awaiting theory' : 'Graded'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{a.objectiveScore ?? '—'}/{test.objectiveMaxScore}</td>
                    {test.theoryMaxScore > 0 && (
                      <td className="px-3 py-2 text-right">
                        {a.status === 'IN_PROGRESS' ? (
                          <span className="text-ink/30">—</span>
                        ) : (
                          <input
                            className="w-16 rounded border px-2 py-1 text-right text-xs"
                            type="number"
                            placeholder={`/${test.theoryMaxScore}`}
                            defaultValue={a.theoryScore ?? ''}
                            onBlur={(e) => e.target.value && handleGradeTheory(a.id, e.target.value)}
                          />
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right">
                      <button className="text-brand-blue hover:underline" onClick={() => onViewAttempt(a.id)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}