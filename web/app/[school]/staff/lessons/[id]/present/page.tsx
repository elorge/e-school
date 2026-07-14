// web/app/[school]/staff/lessons/[id]/present/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getForStaff, type LessonNote } from '@/lib/endpoints/lesson-notes';
import { ChevronLeft, ChevronRight, Maximize, Pencil } from 'lucide-react';
import MathText from '@/components/MathText';
import Whiteboard from '@/components/Whiteboard';

interface Slide {
  heading: string;
  body: string;
}

function buildSlides(note: LessonNote): Slide[] {
  const slides: Slide[] = [];
  slides.push({ heading: note.topic, body: `${note.subject}${note.class ? ` — ${note.class.name}` : ''}` });
  if (note.objectives) slides.push({ heading: 'Objectives', body: note.objectives });
  if (note.previousKnowledge) slides.push({ heading: 'Previous Knowledge', body: note.previousKnowledge });
  // Presentation content splits into its own slides on "---" lines.
  const steps = note.presentation.split(/\n\s*---\s*\n/).filter((s) => s.trim());
  steps.forEach((step, i) => slides.push({ heading: steps.length > 1 ? `Presentation (${i + 1}/${steps.length})` : 'Presentation', body: step }));
  if (note.evaluation) slides.push({ heading: 'Evaluation', body: note.evaluation });
  if (note.assignment) slides.push({ heading: 'Assignment', body: note.assignment });
  if (note.summary) slides.push({ heading: 'Summary', body: note.summary });
  return slides;
}

export default function PresentLessonNotePage({ params }: { params: { school: string; id: string } }) {
  const [note, setNote] = useState<LessonNote | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  useEffect(() => {
    getForStaff(params.school, params.id).then((n) => {
      setNote(n);
      setSlides(buildSlides(n));
    });
  }, [params.school, params.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length]);

  if (!note || slides.length === 0) return null;
  const slide = slides[index];

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-6 py-3 text-sm text-white/50">
        <span>
          {index + 1} / {slides.length}
        </span>
        <div className="flex items-center gap-4">
          <button onClick={() => setWhiteboardOpen(true)} className="flex items-center gap-1">
            <Pencil size={14} /> Whiteboard
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="flex items-center gap-1">
            <Maximize size={14} /> Fullscreen
          </button>
        </div>
      </div>

      {whiteboardOpen && <Whiteboard onClose={() => setWhiteboardOpen(false)} />}

      <div className="flex flex-1 flex-col items-center justify-center px-12 text-center">
        <p className="mb-6 font-mono text-sm uppercase tracking-[0.3em] text-brand-green">{slide.heading}</p>
        <div className="max-w-3xl whitespace-pre-wrap font-display text-3xl leading-relaxed sm:text-4xl">
          <MathText text={slide.body} />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-sm disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
          disabled={index === slides.length - 1}
          className="flex items-center gap-1 rounded-full bg-brand-blue px-4 py-2 text-sm disabled:opacity-30"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}