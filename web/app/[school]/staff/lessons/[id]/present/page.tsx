// web/app/[school]/staff/lessons/[id]/present/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getForStaff, type LessonNote } from '@/lib/endpoints/lesson-notes';
import { ChevronLeft, ChevronRight, Maximize, Pencil, Eraser, Cast, X } from 'lucide-react';
import MathText from '@/components/MathText';
import Whiteboard from '@/components/Whiteboard';
import QrCode from '@/components/QrCode';
import { useSchool } from '@/lib/school-context';
import { lessonLabelsFor, LessonLabels } from '@/lib/i18n/lesson-labels';
import { useProjectingSession } from '@/lib/projecting/useProjectingSession';
import { installCapacitorLocalServerBridge } from '@/lib/projecting/capacitor-bridge';

interface Slide {
  heading: string;
  body?: string;
  materialUrl?: string;
}

function materialSlidesFor(note: LessonNote, anchor: string, t: LessonLabels): Slide[] {
  return note.materials.filter((m) => m.insertAfter === anchor).map((m) => ({ heading: m.originalFilename ?? t.materialFallbackHeading, materialUrl: m.url }));
}

function buildSlides(note: LessonNote, t: LessonLabels): Slide[] {
  const slides: Slide[] = [];
  slides.push({ heading: note.topic, body: `${note.subject}${note.class ? ` — ${note.class.name}` : ''}` });
  slides.push(...materialSlidesFor(note, 'start', t));

  if (note.objectives) {
    slides.push({ heading: t.objectives, body: note.objectives });
    slides.push(...materialSlidesFor(note, 'objectives', t));
  }
  if (note.previousKnowledge) {
    slides.push({ heading: t.previousKnowledge, body: note.previousKnowledge });
    slides.push(...materialSlidesFor(note, 'previousKnowledge', t));
  }

  const steps = note.presentation.split(/\n\s*---\s*\n/).filter((s) => s.trim());
  steps.forEach((step, i) => {
    slides.push({ heading: t.presentationSlideHeading(i + 1, steps.length), body: step });
  });

  if (note.evaluation) {
    slides.push({ heading: t.evaluation, body: note.evaluation });
    slides.push(...materialSlidesFor(note, 'evaluation', t));
  }
  if (note.assignment) {
    slides.push({ heading: t.assignment, body: note.assignment });
    slides.push(...materialSlidesFor(note, 'assignment', t));
  }
  if (note.summary) {
    slides.push({ heading: t.summary, body: note.summary });
    slides.push(...materialSlidesFor(note, 'summary', t));
  }

  slides.push(...materialSlidesFor(note, 'end', t));
  return slides;
}

export default function PresentLessonNotePage({ params }: { params: { school: string; id: string } }) {
  const school = useSchool();
  const t = lessonLabelsFor(school.locale);
  const [note, setNote] = useState<LessonNote | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  // null = closed. 'overlay' = draws directly on top of the current slide,
  // pinned to it — annotations clear when you move to a different slide.
  // 'fullscreen' = the original blank black canvas, unrelated to any slide.
  const [whiteboardMode, setWhiteboardMode] = useState<'overlay' | 'fullscreen' | null>(null);
  const projecting = useProjectingSession();
  const [showJoinPanel, setShowJoinPanel] = useState(false);

  useEffect(() => {
    // Installs window.ElorgeLocalServer if (and only if) this page is
    // running inside the native Capacitor app — a no-op plain web
    // build, silently. useProjectingSession checks its result via
    // isProjectingSupported() the moment the user taps the button, so
    // this only needs to run once, early.
    installCapacitorLocalServerBridge();
  }, []);

  useEffect(() => {
    getForStaff(params.school, params.id).then((n) => {
      setNote(n);
      setSlides(buildSlides(n, t));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.school, params.id]);

  // Every time the teacher's own slide changes, push it to whichever
  // students are currently polling — a no-op while no session is active.
  useEffect(() => {
    projecting.syncSlideIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, projecting.status]);

  async function handleToggleProjecting() {
    if (projecting.status === 'active') {
      await projecting.stop();
      setShowJoinPanel(false);
    } else if (projecting.status === 'unavailable') {
      setShowJoinPanel(true); // shows the "not available on this device" explainer instead
    } else {
      await projecting.start(slides);
      setShowJoinPanel(true);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (whiteboardMode === 'overlay') return; // don't advance slides while actively annotating
      if (e.key === 'ArrowRight' || e.key === ' ') setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length, whiteboardMode]);

  if (!note || slides.length === 0) return null;
  const slide = slides[index];

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-6 py-3 text-sm text-white/50">
        <span>
          {index + 1} / {slides.length}
        </span>
        <div className="flex items-center gap-4">
          <button onClick={() => setWhiteboardMode('overlay')} className="flex items-center gap-1">
            <Pencil size={14} /> {t.annotateSlide}
          </button>
          <button onClick={() => setWhiteboardMode('fullscreen')} className="flex items-center gap-1">
            <Eraser size={14} /> {t.blankWhiteboard}
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="flex items-center gap-1">
            <Maximize size={14} /> {t.fullscreen}
          </button>
          <button onClick={handleToggleProjecting} className="flex items-center gap-1">
            <Cast size={14} className={projecting.status === 'active' ? 'text-brand-green' : ''} />
            {projecting.status === 'active' ? t.stopProjecting : projecting.status === 'starting' ? t.starting : t.projectToStudents}
          </button>
        </div>
      </div>

      {whiteboardMode === 'fullscreen' && <Whiteboard onClose={() => setWhiteboardMode(null)} />}

      {showJoinPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowJoinPanel(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-ink shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-medium">
                <Cast size={16} /> {t.projectToStudents}
              </p>
              <button onClick={() => setShowJoinPanel(false)} className="text-ink/40 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            {projecting.status === 'unavailable' && (
              <div>
                <p className="mb-1 text-sm font-medium">{t.projectingUnavailableTitle}</p>
                <p className="text-sm text-ink/60">{t.projectingUnavailableBody}</p>
              </div>
            )}

            {projecting.status === 'active' && projecting.viewerUrl && (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-ink/60">{t.scanToJoin}</p>
                <QrCode value={projecting.viewerUrl} />
                <p className="text-sm font-medium text-brand-green">{t.studentsConnected(projecting.connectedCount)}</p>
                <button onClick={handleToggleProjecting} className="btn-secondary w-full">
                  {t.stopProjecting}
                </button>
              </div>
            )}

            {projecting.status === 'error' && (
              <p className="text-sm text-red-600">{projecting.error ?? t.couldNotStartProjecting}</p>
            )}
          </div>
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center justify-center px-12 text-center">
        <p className="mb-6 font-mono text-sm uppercase tracking-[0.3em] text-brand-green">{slide.heading}</p>
        {slide.materialUrl ? (
          <img src={slide.materialUrl} alt={slide.heading} className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-2xl" />
        ) : (
          <div className="max-w-3xl whitespace-pre-wrap font-display text-3xl leading-relaxed sm:text-4xl">
            <MathText text={slide.body ?? ''} />
          </div>
        )}

        {/* Remounts (clearing all strokes) whenever the slide index changes,
            since an annotation belongs to the slide it was drawn on top of. */}
        {whiteboardMode === 'overlay' && (
          <Whiteboard key={`overlay-${index}`} overlay onClose={() => setWhiteboardMode(null)} />
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-sm disabled:opacity-30"
        >
          <ChevronLeft size={16} /> {t.back}
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(i + 1, slides.length - 1))}
          disabled={index === slides.length - 1}
          className="flex items-center gap-1 rounded-full bg-brand-blue px-4 py-2 text-sm disabled:opacity-30"
        >
          {t.next} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}