// web/app/[school]/lessons/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPublicLessonNote, type LessonNote } from '@/lib/endpoints/lesson-notes';
import MathText from '@/components/MathText';

function Section({ title, body }: { title: string; body: string | null | undefined }) {
  if (!body) return null;
  return (
    <div className="mb-6">
      <h2 className="mb-1 font-display text-sm font-semibold uppercase tracking-wide text-brand-blue">{title}</h2>
      <div className="whitespace-pre-wrap text-ink/80">
        <MathText text={body} />
      </div>
    </div>
  );
}

export default function PublicLessonNotePage({ params }: { params: { school: string; id: string } }) {
  const searchParams = useSearchParams();
  const admissionId = searchParams.get('admissionId');
  const [note, setNote] = useState<LessonNote | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!admissionId) {
      setError(true);
      return;
    }
    getPublicLessonNote(params.school, params.id, admissionId)
      .then(setNote)
      .catch(() => setError(true));
  }, [params.school, params.id, admissionId]);

  if (error) return <p className="mx-auto max-w-2xl px-4 py-10 text-sm text-red-600">This lesson note isn't available.</p>;
  if (!note) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="mb-1 text-sm text-ink/50">
        {note.subject} {note.class ? `— ${note.class.name}` : ''}
      </p>
      <h1 className="mb-6 font-display text-2xl font-semibold">{note.topic}</h1>

      <Section title="Objectives" body={note.objectives} />
      <Section title="Previous Knowledge" body={note.previousKnowledge} />
      <Section title="Presentation" body={note.presentation.replace(/\n\s*---\s*\n/g, '\n\n')} />
      <Section title="Evaluation" body={note.evaluation} />
      <Section title="Assignment" body={note.assignment} />
      <Section title="Summary" body={note.summary} />
    </main>
  );
}