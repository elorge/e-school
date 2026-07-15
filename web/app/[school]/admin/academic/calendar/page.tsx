// web/app/[school]/admin/academic/calendar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listTerms } from '@/lib/endpoints/terms';
import {
  listCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  generateTermSchedule,
} from '@/lib/endpoints/calendar';
import type { Term, CalendarEvent, CalendarEventType } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';

const EVENT_TYPES: CalendarEventType[] = [
  'TERM_START',
  'TERM_END',
  'MIDTERM_BREAK',
  'EXAM_PERIOD',
  'RESUMPTION',
  'PTA_MEETING',
  'HOLIDAY',
  'CUSTOM',
];

export default function CalendarPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [termId, setTermId] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [draft, setDraft] = useState<Omit<CalendarEvent, 'id' | 'schoolId'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({ type: 'CUSTOM' as CalendarEventType, title: '', startDate: '', endDate: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [genForm, setGenForm] = useState({ startDate: '', weeks: 13, midtermBreakWeek: 6, examWeeks: 2 });

  useEffect(() => {
    listTerms(params.school)
      .then(setTerms)
      .finally(() => setIsLoading(false));
  }, [params.school]);

  useEffect(() => {
    if (termId) listCalendarEvents(params.school, termId).then(setEvents);
  }, [termId, params.school]);

async function handleSubmitEvent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateCalendarEvent(params.school, editingId, form);
        setEditingId(null);
      } else {
        await createCalendarEvent(params.school, { termId, ...form });
      }
      setForm({ type: 'CUSTOM', title: '', startDate: '', endDate: '', description: '' });
      setEvents(await listCalendarEvents(params.school, termId));
    } catch {
      setError(editingId ? 'Could not save changes' : 'Could not add event');
    }
  }

  function startEditing(event: CalendarEvent) {
    setEditingId(event.id);
    setForm({
      type: event.type,
      title: event.title,
      startDate: event.startDate.slice(0, 10),
      endDate: event.endDate ? event.endDate.slice(0, 10) : '',
      description: event.description ?? '',
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({ type: 'CUSTOM', title: '', startDate: '', endDate: '', description: '' });
  }

  async function handleDelete(id: string) {
    await deleteCalendarEvent(params.school, id);
    setEvents(await listCalendarEvents(params.school, termId));
  }

  async function handleGenerateDraft() {
    setError(null);
    setNotice(null);
    try {
      const result = await generateTermSchedule(params.school, { termId, ...genForm });
      setDraft(result);
      setNotice('Draft generated below — review it, then save the ones you want to keep.');
    } catch {
      setError('Could not generate a draft — check the start date and week counts');
    }
  }

  async function handleSaveDraftEvent(event: Omit<CalendarEvent, 'id' | 'schoolId'>) {
    await createCalendarEvent(params.school, {
      termId,
      type: event.type,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate ?? undefined,
    });
    setDraft((d) => d.filter((e) => e !== event));
    setEvents(await listCalendarEvents(params.school, termId));
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Academic Calendar</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <label className="flex w-fit flex-col gap-1 text-sm">
        Term
        <select className="rounded border px-2 py-1.5" value={termId} onChange={(e) => setTermId(e.target.value)}>
          <option value="">Select a term</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {termId && (
        <>
          <section className="card">
            <h2 className="mb-3 font-medium">Generate a draft term schedule</h2>
            <p className="mb-3 text-xs text-ink/50">
              Nothing is saved yet — review the draft below and save only the events you want.
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs">
                Resumption date
                <input
                  className="rounded border px-2 py-1.5 text-sm"
                  type="date"
                  value={genForm.startDate}
                  onChange={(e) => setGenForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Weeks in term
                <input
                  className="w-20 rounded border px-2 py-1.5 text-sm"
                  type="number"
                  value={genForm.weeks}
                  onChange={(e) => setGenForm((f) => ({ ...f, weeks: Number(e.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Midterm break (week #)
                <input
                  className="w-24 rounded border px-2 py-1.5 text-sm"
                  type="number"
                  value={genForm.midtermBreakWeek}
                  onChange={(e) => setGenForm((f) => ({ ...f, midtermBreakWeek: Number(e.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                Exam weeks (at end)
                <input
                  className="w-20 rounded border px-2 py-1.5 text-sm"
                  type="number"
                  value={genForm.examWeeks}
                  onChange={(e) => setGenForm((f) => ({ ...f, examWeeks: Number(e.target.value) }))}
                />
              </label>
              <button onClick={handleGenerateDraft} className="rounded bg-brand-green px-3 py-1.5 text-sm text-white">
                Generate draft
              </button>
            </div>

            {draft.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {draft.map((e, i) => (
                  <li key={i} className="flex items-center justify-between rounded bg-black/5 px-3 py-2 text-sm">
                    <span>
                      {e.title} — {e.startDate.slice(0, 10)}
                      {e.endDate ? ` to ${e.endDate.slice(0, 10)}` : ''}
                    </span>
                    <button onClick={() => handleSaveDraftEvent(e)} className="text-brand-blue underline">
                      Save
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 font-medium">{editingId ? 'Edit event' : 'Add an event manually'}</h2>
            <form onSubmit={handleSubmitEvent} className="flex flex-wrap items-end gap-2">
              <select
                className="rounded border px-2 py-1.5 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CalendarEventType }))}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <input
                className="rounded border px-2 py-1.5 text-sm"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <input
                className="rounded border px-2 py-1.5 text-sm"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
              />
              <input
                className="rounded border px-2 py-1.5 text-sm"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
              <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
                {editingId ? 'Save changes' : 'Add'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEditing} className="rounded border px-3 py-1.5 text-sm">
                  Cancel
                </button>
              )}
            </form>
          </section>

          <section className="card">
            <h2 className="mb-3 font-medium">This term's events</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between">
                  <span>
                    {e.title} — {e.startDate.slice(0, 10)}
                    {e.endDate ? ` to ${e.endDate.slice(0, 10)}` : ''}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => startEditing(e)} className="text-xs text-brand-blue underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-600 underline">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}