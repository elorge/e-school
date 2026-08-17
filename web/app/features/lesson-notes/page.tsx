// web/app/features/lesson-notes/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { NotebookPen, Presentation, Pencil, Lock, BookOpen, Users2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'School Lesson Note Software — Write, Present & Publish Lesson Notes',
  description:
    'Lesson notes in the standard Nigerian format, turned into a projector-ready slide deck with one click and a built-in whiteboard — then published for students in that class to read again at home.',
  alternates: { canonical: '/features/lesson-notes' },
  openGraph: {
    title: 'School Lesson Note Software — Write, Present & Publish Lesson Notes',
    description:
      'Written once in the format teachers already know, taught on the board with a built-in whiteboard, and read again at home.',
    url: 'https://elorgeschools.com/features/lesson-notes',
  },
};

const HOW_IT_WORKS = [
  {
    icon: NotebookPen,
    title: 'Write in the format you already know',
    body: 'Objectives, previous knowledge, presentation, evaluation, assignment — the standard Nigerian lesson-note structure, not a blank text box.',
  },
  {
    icon: Presentation,
    title: 'One click to the projector',
    body: 'Turn the same note into a clean, full-screen slide deck instantly. No separate slides to build, no formatting to fight with.',
  },
  {
    icon: Pencil,
    title: 'Teach live with a built-in whiteboard',
    body: 'Pen, eraser, and colors sit right over the slide, so a teacher can work through a problem step by step in front of the class.',
  },
];

const FEATURES = [
  {
    icon: Lock,
    title: 'Gated to the right class',
    body: 'A published note is visible only to that class\'s own students — not the open internet, and not other classes\' students.',
  },
  {
    icon: BookOpen,
    title: 'Read again at home',
    body: 'Once published, a student can revisit the exact note their teacher taught from, at their own pace, whenever they need to.',
  },
  {
    icon: Users2,
    title: 'Built on the supervision format',
    body: 'The same structure schools already use for lesson-note supervision, so there\'s nothing new for a head teacher to learn to review it.',
  },
];

const FAQS = [
  {
    q: 'What format do lesson notes follow?',
    a: 'The standard Nigerian lesson-note structure: objectives, previous knowledge, presentation, evaluation, and assignment — the same format most schools already use for supervision.',
  },
  {
    q: 'Can a lesson note become a presentation automatically?',
    a: 'Yes. One click turns a written note into a full-screen slide deck for the projector, with a whiteboard overlay for working through problems live — no separate slides to build.',
  },
  {
    q: 'Who can see a published lesson note?',
    a: 'Only students in the class the note was written for. Notes are not visible to other classes or to the open internet.',
  },
  {
    q: 'Can students revisit a lesson note after class?',
    a: 'Yes. Once a teacher publishes a note, students in that class can read it again at home at their own pace.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function LessonNotesFeaturePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Lesson notes</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Written once. Taught on the board. Read again at home.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            Teachers write in the structured format they already know for supervision — then one click turns it into
            a projector-ready slide deck, with a whiteboard built in for working through a problem live.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
            >
              Get started
            </Link>
            <Link href="/#lesson-notes" className="rounded-full border border-black/10 px-6 py-3 font-medium text-ink transition hover:bg-black/5">
              See it on the homepage
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">From written note to live lesson, in one click.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">
                    {i + 1}. {title}
                  </h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">More than a document — a teaching tool.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="border-l-2 border-brand-green/20 pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold text-ink">Common questions about lesson notes.</h2>
            <div className="flex flex-col gap-8">
              {FAQS.map((faq) => (
                <div key={faq.q}>
                  <h3 className="mb-2 font-display text-lg font-semibold text-ink">{faq.q}</h3>
                  <p className="text-sm text-ink/60">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-black/5 px-6 py-20 text-center">
          <h2 className="mb-6 font-display text-3xl font-semibold">Ready to publish your first lesson note?</h2>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Get started
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}