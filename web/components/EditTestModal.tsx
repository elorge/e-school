// web/components/EditTestModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateTest, type CbtTest } from '@/lib/endpoints/cbt';

export default function EditTestModal({
  school,
  test,
  onClose,
  onSaved,
}: {
  school: string;
  test: CbtTest;
  onClose: () => void;
  onSaved: (updated: CbtTest) => void;
}) {
  const isDraft = test.status === 'DRAFT';
  const [form, setForm] = useState({
    title: test.title,
    subject: test.subject,
    durationMinutes: test.durationMinutes,
    theoryMaxScore: test.theoryMaxScore,
    scheduledDate: test.scheduledDate.slice(0, 10),
    countsTowardReport: test.countsTowardReport,
    componentName: test.componentName,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Only send what this status is allowed to change — matches the
      // backend's own allow-list, so nothing gets silently dropped that
      // the user thought they'd saved.
      const payload = isDraft
        ? form
        : { title: form.title, scheduledDate: form.scheduledDate };
      const updated = await updateTest(school, test.id, payload);
      onSaved(updated);
      onClose();
    } catch {
      setError('Could not save changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Edit "{test.title}"</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><X size={18} /></button>
        </div>

        {!isDraft && (
          <p className="mb-3 rounded bg-amber-50 p-2 text-xs text-amber-800">
            This test is {test.status.toLowerCase()}. Only the title and date can be changed —
            scoring settings and duration are locked once questions have been answered against them.
          </p>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Title
            <input className="rounded border px-2 py-1.5" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {isDraft ? 'Test date' : 'Reschedule to'}
            <input
              className="rounded border px-2 py-1.5"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              required
            />
            {!isDraft && (
              <span className="text-xs text-ink/40">The access code will only work on the new date.</span>
            )}
          </label>

          {isDraft && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                Subject
                <input className="rounded border px-2 py-1.5" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Duration (minutes)
                <input className="rounded border px-2 py-1.5" type="number" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Theory portion max score
                <input className="rounded border px-2 py-1.5" type="number" value={form.theoryMaxScore} onChange={(e) => setForm((f) => ({ ...f, theoryMaxScore: Number(e.target.value) }))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Report card component
                <input className="rounded border px-2 py-1.5" value={form.componentName} onChange={(e) => setForm((f) => ({ ...f, componentName: e.target.value }))} />
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={form.countsTowardReport} onChange={(e) => setForm((f) => ({ ...f, countsTowardReport: e.target.checked }))} />
                Counts toward the report card
              </label>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary px-3 py-1.5 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}