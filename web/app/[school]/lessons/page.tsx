// web/app/[school]/lessons/page.tsx
// web/app/[school]/lessons/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listPublicLessonNotes, type LessonNote } from '@/lib/endpoints/lesson-notes';
import { BookOpen } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { useSchool } from '@/lib/school-context';
import { lessonLabelsFor } from '@/lib/i18n/lesson-labels';
import { apiErrorMessage } from '@/lib/i18n/error-messages';

const STORAGE_KEY = 'eschools_lesson_notes_admission_id';

export default function PublicLessonsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = lessonLabelsFor(school.locale);
  const [admissionId, setAdmissionId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAdmissionId(saved);
      setInputValue(saved);
    }
  }, []);

  useEffect(() => {
    if (!admissionId) return;
    setError(null);
    listPublicLessonNotes(params.school, admissionId)
      .then((n) => {
        setNotes(n);
        localStorage.setItem(STORAGE_KEY, admissionId); // remembered locally, so this only has to be typed once per device
      })
      .catch((err) => {
        setError(apiErrorMessage(err, school.locale, t.couldNotVerifyAdmissionId));
        localStorage.removeItem(STORAGE_KEY);
      });
  }, [admissionId, params.school]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdmissionId(inputValue);
  }

  if (!admissionId || error) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <BookOpen size={20} /> {t.lessonNotes}
        </h1>
        <p className="mb-6 text-sm text-ink/60">{t.enterAdmissionId}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="rounded border px-3 py-2"
            placeholder={t.admissionIdPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="rounded bg-brand-blue px-4 py-2 text-white">
            {t.continueBtn}
          </button>
        </form>
      </main>
    );
  }

  const subjects = Array.from(new Set(notes.map((n) => n.subject))).sort();
  const filtered = subjectFilter ? notes.filter((n) => n.subject === subjectFilter) : notes;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 flex items-center gap-2 text-xl font-semibold">
        <BookOpen size={20} /> {t.lessonNotes}
      </h1>
      <p className="mb-6 text-sm text-ink/60">{t.browseNotes}</p>

      {subjects.length > 0 && (
        <select className="mb-4 rounded border px-3 py-2 text-sm" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="">{t.allSubjects}</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {filtered.length === 0 && <p className="text-sm text-ink/40">{t.noNotesShared}</p>}

      <ul className="flex flex-col gap-2">
        {filtered.map((note) => (
          <li key={note.id}>
            <Link
              href={`/${params.school}/lessons/${note.id}?admissionId=${encodeURIComponent(admissionId)}`}
              className="block card hover:bg-black/5"
            >
              <p className="font-medium">{note.topic}</p>
              <p className="text-sm text-ink/50">
                {note.subject} {note.class ? `— ${note.class.name}` : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}