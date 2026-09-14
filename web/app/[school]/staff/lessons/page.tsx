// web/app/[school]/staff/lessons/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listTerms } from '@/lib/endpoints/terms';
import {
  listForStaff,
  createLessonNote,
  updateLessonNote,
  publishLessonNote,
  unpublishLessonNote,
  deleteLessonNote,
  deleteMaterial,
  uploadMaterial,
  type LessonNote,
  type LessonNoteInput,
} from '@/lib/endpoints/lesson-notes';
import type { Class, Term } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import { NotebookPen, Presentation as PresentationIcon, Link as LinkIcon } from 'lucide-react';
import { lessonLabelsFor } from '@/lib/i18n/lesson-labels';

const BLANK: LessonNoteInput = {
  classId: '',
  termId: '',
  subject: '',
  topic: '',
  durationMinutes: 40,
  objectives: '',
  instructionalMaterials: '',
  previousKnowledge: '',
  presentation: '',
  evaluation: '',
  assignment: '',
  summary: '',
};

export default function LessonNotesPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = lessonLabelsFor(school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonNoteInput>(BLANK);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const currentNoteMaterials = notes.find((n) => n.id === editingId)?.materials ?? [];

  async function load() {
    try {
      const [c, t, n] = await Promise.all([listClasses(params.school), listTerms(params.school), listForStaff(params.school)]);
      setClasses(c);
      setTerms(t);
      setNotes(n);
    } catch {
      setError(t.failedToLoad);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateLessonNote(params.school, editingId, form);
        setNotice(t.savedNotice);
      } else {
        await createLessonNote(params.school, form);
        setNotice(t.draftCreatedNotice);
      }
      setForm(BLANK);
      setEditingId(null);
      load();
    } catch {
      setError(t.couldNotSaveNote);
    }
  }

  function startEditing(note: LessonNote) {
    setEditingId(note.id);
    setForm({
      classId: note.classId,
      termId: note.termId,
      subject: note.subject,
      topic: note.topic,
      durationMinutes: note.durationMinutes,
      objectives: note.objectives,
      instructionalMaterials: note.instructionalMaterials ?? '',
      previousKnowledge: note.previousKnowledge ?? '',
      presentation: note.presentation,
      evaluation: note.evaluation ?? '',
      assignment: note.assignment ?? '',
      summary: note.summary ?? '',
    });
  }

  async function handlePublishToggle(note: LessonNote) {
    if (note.status === 'PUBLISHED') await unpublishLessonNote(params.school, note.id);
    else await publishLessonNote(params.school, note.id);
    load();
  }

  async function handleDelete(id: string) {
    await deleteLessonNote(params.school, id);
    load();
  }

  async function handleMaterialUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    const anchor = (document.getElementById('material-anchor') as HTMLSelectElement).value;
    setIsUploadingMaterial(true);
    setError(null);
    try {
      await uploadMaterial(params.school, editingId, file, anchor);
      await load();
    } catch (err) {
      setError(t.couldNotUploadMaterial);
    } finally {
      setIsUploadingMaterial(false);
      e.target.value = '';
    }
  }

  async function handleDeleteMaterial(materialId: string) {
    if (!editingId) return;
    await deleteMaterial(params.school, editingId, materialId);
    load();
  }

  function copyStudentLink(id: string) {
    const url = `${window.location.origin}/${params.school}/lessons/${id}`;
    navigator.clipboard.writeText(url);
    setNotice(t.studentLinkCopiedNotice);
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <NotebookPen size={20} /> {school.name} — {t.pageTitle}
      </h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <section className="card">
        <h2 className="mb-3 font-medium">{editingId ? t.editNote : t.newNote}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="rounded border px-2 py-1.5 text-sm"
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
              required
            >
              <option value="">{t.classLabel}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="rounded border px-2 py-1.5 text-sm"
              value={form.termId}
              onChange={(e) => setForm((f) => ({ ...f, termId: e.target.value }))}
              required
            >
              <option value="">{t.termLabel}</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder={t.subjectPlaceholder}
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder={t.topicPlaceholder}
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              type="number"
              placeholder={t.durationPlaceholder}
              value={form.durationMinutes ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            />
          </div>

          <label className="flex flex-col gap-1 text-sm">
            {t.objectivesFieldLabel}
            <textarea
              className="min-h-[60px] rounded border px-2 py-1.5 text-sm"
              value={form.objectives}
              onChange={(e) => setForm((f) => ({ ...f, objectives: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.instructionalMaterialsLabel}
            <input
              className="rounded border px-2 py-1.5 text-sm"
              value={form.instructionalMaterials ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, instructionalMaterials: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.previousKnowledgeFieldLabel}
            <textarea
              className="min-h-[50px] rounded border px-2 py-1.5 text-sm"
              value={form.previousKnowledge ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, previousKnowledge: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.presentationFieldLabel}
            <textarea
              className="min-h-[160px] rounded border px-2 py-1.5 font-mono text-sm"
              value={form.presentation}
              onChange={(e) => setForm((f) => ({ ...f, presentation: e.target.value }))}
              placeholder={t.presentationPlaceholderExample}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.evaluationFieldLabel}
            <textarea
              className="min-h-[60px] rounded border px-2 py-1.5 text-sm"
              value={form.evaluation ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, evaluation: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.assignmentFieldLabel}
            <textarea
              className="min-h-[50px] rounded border px-2 py-1.5 text-sm"
              value={form.assignment ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, assignment: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.summaryFieldLabel}
            <textarea
              className="min-h-[50px] rounded border px-2 py-1.5 text-sm"
              value={form.summary ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </label>

          <div className="flex gap-2">
            <button type="submit" className="w-fit rounded bg-brand-blue px-4 py-2 text-sm text-white">
              {editingId ? t.saveChanges : t.saveAsDraft}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(BLANK);
                }}
                className="rounded border px-4 py-2 text-sm"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      </section>

      {editingId && (
        <section className="card">
          <h2 className="mb-3 font-medium">{t.materialsHeading}</h2>
          <p className="mb-2 text-xs text-ink/50">{t.materialsHelp}</p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select id="material-anchor" className="rounded border px-2 py-1.5 text-xs">
              <option value="start">{t.anchorStart}</option>
              <option value="objectives">{t.anchorAfterObjectives}</option>
              <option value="previousKnowledge">{t.anchorAfterPreviousKnowledge}</option>
              <option value="evaluation">{t.anchorAfterEvaluation}</option>
              <option value="assignment">{t.anchorAfterAssignment}</option>
              <option value="summary">{t.anchorAfterSummary}</option>
              <option value="end">{t.anchorEnd}</option>
            </select>
            <label className="cursor-pointer rounded bg-brand-green px-3 py-1.5 text-xs text-white">
              {isUploadingMaterial ? t.uploading : t.uploadFile}
              <input
                type="file"
                accept="image/*,.pdf,.pptx"
                className="hidden"
                disabled={isUploadingMaterial}
                onChange={handleMaterialUpload}
              />
            </label>
          </div>
          <ul className="flex flex-col gap-1 text-xs">
            {currentNoteMaterials.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded bg-black/5 px-2 py-1.5">
                <span className="truncate">
                  {m.originalFilename ?? m.type} — {m.insertAfter}
                </span>
                <button onClick={() => handleDeleteMaterial(m.id)} className="text-red-600 underline">
                  {t.remove}
                </button>
              </li>
            ))}
            {currentNoteMaterials.length === 0 && <li className="text-ink/40">{t.noMaterialsYet}</li>}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="mb-3 font-medium">{t.allNotesHeading}</h2>
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li key={note.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-sm last:border-b-0">
              <span>
                <strong>{note.topic}</strong> — {note.subject}{' '}
                <span className={`badge ${note.status === 'PUBLISHED' ? 'badge-green' : 'badge-amber'}`}>{note.status}</span>
              </span>
              <div className="flex items-center gap-3">
                <button onClick={() => startEditing(note)} className="text-brand-blue underline">
                  {t.edit}
                </button>
                <Link href={`/${params.school}/staff/lessons/${note.id}/present`} target="_blank" className="flex items-center gap-1 text-brand-blue underline">
                  <PresentationIcon size={13} /> {t.present}
                </Link>
                {note.status === 'PUBLISHED' && (
                  <button onClick={() => copyStudentLink(note.id)} className="flex items-center gap-1 text-brand-green underline">
                    <LinkIcon size={13} /> {t.copyStudentLink}
                  </button>
                )}
                <button onClick={() => handlePublishToggle(note)} className="text-xs underline">
                  {note.status === 'PUBLISHED' ? t.unpublish : t.publish}
                </button>
                <button onClick={() => handleDelete(note.id)} className="text-xs text-red-600 underline">
                  {t.deleteBtn}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}