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
import { calendarLabelsFor } from '@/lib/i18n/calendar-labels';
import type { Term, CalendarEvent, CalendarEventType } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';

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
  const t = calendarLabelsFor(school.locale);
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

  // Draft editing — drafts have no id yet (nothing's saved), so we track
  // which one is being edited by its position in the array instead.
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(null);
  const [draftEditForm, setDraftEditForm] = useState({
    type: 'CUSTOM' as CalendarEventType,
    title: '',
    startDate: '',
    endDate: '',
  });

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
      setError(editingId ? t.couldNotSaveChanges : t.couldNotAddEvent);
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
      setNotice(t.draftGeneratedNotice);
    } catch {
      setError(t.couldNotGenerateDraft);
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

  function startEditingDraft(index: number) {
    const e = draft[index];
    setEditingDraftIndex(index);
    setDraftEditForm({
      type: e.type,
      title: e.title,
      startDate: e.startDate.slice(0, 10),
      endDate: e.endDate ? e.endDate.slice(0, 10) : '',
    });
  }

  function cancelEditingDraft() {
    setEditingDraftIndex(null);
  }

  function saveDraftEdit(index: number) {
    setDraft((d) =>
      d.map((e, i) =>
        i === index
          ? {
              ...e,
              type: draftEditForm.type,
              title: draftEditForm.title,
              startDate: new Date(draftEditForm.startDate).toISOString(),
              endDate: draftEditForm.endDate ? new Date(draftEditForm.endDate).toISOString() : null,
            }
          : e,
      ),
    );
    setEditingDraftIndex(null);
  }

  function deleteDraftEvent(index: number) {
    setDraft((d) => d.filter((_, i) => i !== index));
    if (editingDraftIndex === index) setEditingDraftIndex(null);
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <label className="flex w-fit flex-col gap-1 text-sm">
        {t.termLabel}
        <select className="rounded border px-2 py-1.5" value={termId} onChange={(e) => setTermId(e.target.value)}>
          <option value="">{t.selectTerm}</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </label>

      {termId && (
        <>
          <section className="card">
            <h2 className="mb-3 font-medium">{t.generateDraftHeading}</h2>
            <p className="mb-3 text-xs text-ink/50">{t.generateDraftHelp}</p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs">
                {t.resumptionDateLabel}
                <input
                  className="rounded border px-2 py-1.5 text-sm"
                  type="date"
                  value={genForm.startDate}
                  onChange={(e) => setGenForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                {t.weeksInTermLabel}
                <input
                  className="w-20 rounded border px-2 py-1.5 text-sm"
                  type="number"
                  value={genForm.weeks}
                  onChange={(e) => setGenForm((f) => ({ ...f, weeks: Number(e.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                {t.midtermBreakLabel}
                <input
                  className="w-24 rounded border px-2 py-1.5 text-sm"
                  type="number"
                  value={genForm.midtermBreakWeek}
                  onChange={(e) => setGenForm((f) => ({ ...f, midtermBreakWeek: Number(e.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                {t.examWeeksLabel}
                <input
                  className="w-20 rounded border px-2 py-1.5 text-sm"
                  type="number"
                  value={genForm.examWeeks}
                  onChange={(e) => setGenForm((f) => ({ ...f, examWeeks: Number(e.target.value) }))}
                />
              </label>
              <button onClick={handleGenerateDraft} className="rounded bg-brand-green px-3 py-1.5 text-sm text-white">
                {t.generateDraftBtn}
              </button>
            </div>

            {draft.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {draft.map((e, i) =>
                  editingDraftIndex === i ? (
                    <li
                      key={i}
                      className="flex flex-wrap items-end gap-2 rounded border border-brand-blue bg-brand-blue/5 px-3 py-2 text-sm"
                    >
                      <select
                        className="rounded border px-2 py-1 text-xs"
                        value={draftEditForm.type}
                        onChange={(ev) => setDraftEditForm((f) => ({ ...f, type: ev.target.value as CalendarEventType }))}
                      >
                        {EVENT_TYPES.map((et) => (
                          <option key={et} value={et}>
                            {t.eventTypeLabels[et]}
                          </option>
                        ))}
                      </select>
                      <input
                        className="rounded border px-2 py-1 text-xs"
                        placeholder={t.titlePlaceholder}
                        value={draftEditForm.title}
                        onChange={(ev) => setDraftEditForm((f) => ({ ...f, title: ev.target.value }))}
                      />
                      <input
                        className="rounded border px-2 py-1 text-xs"
                        type="date"
                        value={draftEditForm.startDate}
                        onChange={(ev) => setDraftEditForm((f) => ({ ...f, startDate: ev.target.value }))}
                      />
                      <input
                        className="rounded border px-2 py-1 text-xs"
                        type="date"
                        value={draftEditForm.endDate}
                        onChange={(ev) => setDraftEditForm((f) => ({ ...f, endDate: ev.target.value }))}
                      />
                      <button onClick={() => saveDraftEdit(i)} className="rounded bg-brand-blue px-2 py-1 text-xs text-white">
                        {t.applyBtn}
                      </button>
                      <button onClick={cancelEditingDraft} className="rounded border px-2 py-1 text-xs">
                        {t.cancelBtn}
                      </button>
                    </li>
                  ) : (
                    <li key={i} className="flex items-center justify-between rounded bg-black/5 px-3 py-2 text-sm">
                      <span>
                        {e.title} — {e.startDate.slice(0, 10)}
                        {e.endDate ? t.toDate(e.endDate.slice(0, 10)) : ''}
                      </span>
                      <div className="flex gap-3">
                        <button onClick={() => startEditingDraft(i)} className="text-xs text-brand-blue underline">
                          {t.editBtn}
                        </button>
                        <button onClick={() => deleteDraftEvent(i)} className="text-xs text-red-600 underline">
                          {t.deleteBtn}
                        </button>
                        <button onClick={() => handleSaveDraftEvent(e)} className="text-brand-blue underline">
                          {t.saveBtn}
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 font-medium">{editingId ? t.editEventHeading : t.addEventManuallyHeading}</h2>
            <form onSubmit={handleSubmitEvent} className="flex flex-wrap items-end gap-2">
              <select
                className="rounded border px-2 py-1.5 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CalendarEventType }))}
              >
                {EVENT_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {t.eventTypeLabels[et]}
                  </option>
                ))}
              </select>
              <input
                className="rounded border px-2 py-1.5 text-sm"
                placeholder={t.titlePlaceholder}
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
                {editingId ? t.saveChangesBtn : t.addBtn}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEditing} className="rounded border px-3 py-1.5 text-sm">
                  {t.cancelBtn}
                </button>
              )}
            </form>
          </section>

          <section className="card">
            <h2 className="mb-3 font-medium">{t.thisTermsEventsHeading}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between">
                  <span>
                    {e.title} — {e.startDate.slice(0, 10)}
                    {e.endDate ? t.toDate(e.endDate.slice(0, 10)) : ''}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => startEditing(e)} className="text-xs text-brand-blue underline">
                      {t.editBtn}
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-600 underline">
                      {t.deleteBtn}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
    </RequireRole>
  );
}
