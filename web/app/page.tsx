// web/app/page.tsx
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CreditCard, ScanLine, Monitor, Wifi, NotebookPen, Presentation, Pencil, Wallet, Boxes, Calculator, Upload } from 'lucide-react';

const CORE_FEATURES = [
  {
    title: 'Results that verify themselves',
    body: 'Every report card carries a QR stamp a parent can scan to confirm it\'s real — no more doubting a transcript.',
  },
  {
    title: 'ID cards & gate attendance',
    body: 'Issue a digital ID the day a student is registered. Scan it at the gate — even if the gate has no signal that morning.',
  },
  {
    title: 'One wallet, not three invoices',
    body: 'Fund once. Result PINs and computer-based tests draw from the same per-student charge — never billed twice for the same student in the same term.',
  },
  {
    title: 'A calendar every teacher can print',
    body: 'Lay out a term in minutes, then hand every class teacher a printable copy — no more retyping the same dates by hand.',
  },
];

const RUN_THE_SCHOOL_FEATURES = [
  {
    title: 'Bulk student import',
    body: 'Already have 400 students on paper or in another system? Download a template, fill it in Excel offline, and upload it — with row-by-row error feedback if something needs fixing.',
  },
  {
    title: 'One-click end-of-session promotion',
    body: 'Move a whole class from JSS1 to JSS2 in a few clicks at year-end, instead of editing every student one at a time.',
  },
  {
    title: 'Staff invites, done properly',
    body: 'Invite a teacher by email — they set their own password to activate, or an admin can set one directly with a forced change on first login.',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-20 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Elorge Technologies School Management Software</p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          A record your parents don't have to take your word for.
        </h1>
        <p className="max-w-xl text-lg text-ink/70">
          Results, ID cards, attendance, fees, computer-based tests, and school finances — in one place, working the
          way your school actually runs: sometimes with signal, sometimes without.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Get started
          </Link>
          <Link href="/login" className="rounded-full border border-black/10 px-6 py-3 font-medium text-ink transition hover:bg-black/5">
            Sign in
          </Link>
        </div>

        {/* Signature element: a mocked, verified report card */}
        <div className="relative mt-10 w-full max-w-md torn-edge">
          <div className="-rotate-2 rounded-t-xl border border-black/10 bg-white p-6 text-left shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-dashed border-black/10 pb-3">
              <span className="font-display text-sm font-semibold">Greenwood College</span>
              <span className="font-mono text-[10px] text-ink/50">2025/2026 — Term 2</span>
            </div>
            <p className="mb-1 font-mono text-xs text-ink/50">Admission ID</p>
            <p className="mb-4 font-mono text-sm">GRW/2025/0148</p>
            <div className="mb-4 flex flex-col gap-1.5 text-sm">
              {[
                ['Mathematics', 82, 'bg-brand-green'],
                ['English Language', 74, 'bg-brand-green'],
                ['Chemistry', 58, 'bg-amber'],
              ].map(([subject, score, color]) => (
                <div key={subject as string} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 text-ink/70">{subject}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                    <span className={`block h-full ${color}`} style={{ width: `${score}%` }} />
                  </span>
                  <span className="w-6 shrink-0 text-right font-mono text-xs">{score}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-brand-green/10 px-3 py-1.5 text-xs text-brand-green-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
              Verified — scan to confirm at elorgeschools.com/verify
            </div>
          </div>
        </div>
      </section>

      {/* Core features */}
      <section id="features" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">
            Everything a registrar's office actually does, in one login.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {CORE_FEATURES.map((feature) => (
              <div key={feature.title} className="border-l-2 border-brand-blue/20 pl-5">
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-ink/60">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Session Wrap — the genuine differentiator, given its own moment */}
      <section id="session-wrap" className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Session Wrap</p>
            <h2 className="mb-4 font-display text-3xl font-semibold">
              Three terms of scores, turned into a starting point for a real conversation.
            </h2>
            <p className="text-ink/70">
              At the end of an academic session, Elorge looks at what a student was consistently strong in — not one
              lucky test, a whole session — and surfaces fields worth exploring because of it. It's not a verdict,
              and we say so on every copy: a starting point for a parent-teacher conversation, not a replacement for
              one.
            </p>
          </div>
          <div className="rounded-2xl bg-ink p-8 text-white torn-edge">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Session Wrap</p>
            <h3 className="mt-1 font-display text-xl font-semibold">2025/2026</h3>
            <p className="mt-1 text-sm text-white/60">3 terms on file</p>
            <div className="mt-6 flex flex-col gap-2">
              {[
                ['Mathematics', 89],
                ['Chemistry', 81],
                ['English', 66],
              ].map(([subject, score]) => (
                <div key={subject as string} className="flex items-center gap-2 text-sm">
                  <span className="w-28 shrink-0 text-white/70">{subject}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className={`block h-full ${(score as number) >= 70 ? 'bg-brand-green' : 'bg-amber'}`}
                      style={{ width: `${score}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right font-mono text-xs">{score}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Fields worth exploring</p>
              <div className="flex flex-wrap gap-2">
                {['Engineering', 'Computer Science', 'Chemical Engineering'].map((f) => (
                  <span key={f} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CBT */}
      <section id="cbt" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Computer-based testing</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">
            For schools with a computer lab — objective questions score themselves.
          </h2>
          <p className="mb-10 max-w-2xl text-ink/70">
            Build a question bank by hand, or download a template, fill it in Excel offline, and upload it in one
            go. Publish a test with a scheduled date and a spoken access code — students log in with just their
            Admission ID, no accounts to create. Objective scores grade instantly; a teacher adds the theory score
            once submissions are in, and the combined result flows straight into the same report card, protected by
            the same parent PIN. No separate system to check.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              ['Scheduled, not open-ended', 'A test\'s access code only works on its scheduled day, within a set window — not next week, not next month.'],
              ['Works if the lab loses signal', 'Answers save to the device first and sync the moment connectivity returns — a dropped connection never loses a student\'s progress.'],
              ['One school, no lab required', 'Schools without a full computer lab still enter every score by hand — nothing here is required to use the rest of the platform.'],
            ].map(([title, body]) => (
              <div key={title}>
                <h3 className="mb-2 font-display text-base font-semibold">{title}</h3>
                <p className="text-sm text-ink/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lesson Notes & Presenter Mode */}
      <section id="lesson-notes" className="border-t border-black/5 px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Lesson notes</p>
            <h2 className="mb-4 font-display text-3xl font-semibold">
              Written once, taught on the board, read again at home.
            </h2>
            <p className="mb-6 text-ink/70">
              Teachers write in the same structured format used for supervision — objectives, previous knowledge,
              presentation, evaluation, assignment. One click turns it into a full-screen slide deck for the
              projector, with a whiteboard overlay for working through a problem live. Publish it, and it's there
              for that class's students to read again at home, at their own pace — gated to their own class, not the
              open internet.
            </p>
            <div className="flex flex-col gap-3">
              {[
                [NotebookPen, 'A format teachers already know', 'The standard Nigerian lesson-note structure — not a blank text box.'],
                [Presentation, 'One click to the projector', 'The same note becomes a clean, full-screen slide deck — no separate slides to build.'],
                [Pencil, 'Whiteboard, built in', 'Pen, eraser, and colors, right over the slide — for working through a step live.'],
              ].map(([Icon, title, body]: any) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-ink/60">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature element: a mocked projector slide with a whiteboard scribble accent */}
          <div className="relative rounded-2xl bg-ink p-8 text-white">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-green">Presentation</p>
            <p className="mb-2 text-sm text-white/50">Mathematics — JSS 2</p>
            <h3 className="mb-6 font-display text-2xl font-semibold leading-snug">
              Solving for x: <br />
              <span className="text-brand-green">2x + 5 = 15</span>
            </h3>
            <svg viewBox="0 0 300 60" className="mb-6 w-full opacity-80">
              <path
                d="M10,45 Q40,10 70,35 T140,25 Q160,15 180,40 T260,20"
                fill="none"
                stroke="#F08C00"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="180" cy="40" r="14" fill="none" stroke="#F08C00" strokeWidth="3" />
            </svg>
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>3 / 6</span>
              <span className="flex items-center gap-1">
                <Pencil size={12} /> Whiteboard active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Offline-first */}
      <section id="offline" className="px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-2xl bg-ink px-8 py-14 text-center text-white">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Offline-first</p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold">
            Register a student, enter a score, sit a test — with no signal at all.
          </h2>
          <p className="max-w-xl text-white/70">
            NEPA cuts the wifi mid-registration season. Elorge is installable straight from your browser, works as a
            real app on your phone or desktop, and keeps working through the outage — syncing everything the moment
            you're back.
          </p>
        </div>
      </section>

      {/* Finance suite — was missing from marketing despite being a full feature set */}
      <section id="finance" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Beyond academics</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">A finance office, built in.</h2>
          <p className="mb-10 max-w-2xl text-ink/70">
            Set a term's fees once, generate invoices for every class, and record payments as they land — cash or
            transfer. Track supplies and equipment so you know before you run out. See income against expenses for
            any date range, exportable to Excel for your accountant.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              [Wallet, 'Fees & invoicing', 'Generate invoices per class per term, record payments, and see who still owes at a glance.'],
              [Boxes, 'Inventory', 'Stock in and out, with automatic low-stock flags before you run out of essentials.'],
              [Calculator, 'Accounting', 'Income and expenditure, by category, for any period — exported to Excel in one click.'],
            ].map(([Icon, title, body]: any) => (
              <div key={title} className="rounded-xl border border-black/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-display text-base font-semibold">{title}</h3>
                <p className="text-sm text-ink/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Running the whole school */}
      <section id="operations" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">
            Onboarding is fast, even with hundreds of existing students.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {RUN_THE_SCHOOL_FEATURES.map((feature) => (
              <div key={feature.title} className="border-l-2 border-brand-green/20 pl-5">
                <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-ink/60">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware & infrastructure — clearly framed as a service offering, not fabricated inventory/pricing */}
      <section id="infrastructure" className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Beyond the software</p>
          <h2 className="mb-4 max-w-2xl font-display text-3xl font-semibold">
            Elorge is also an IT infrastructure company — we can help with the hardware side too.
          </h2>
          <p className="mb-10 max-w-2xl text-ink/70">
            The platform works whether or not you have any of this — but if you're setting up ID cards, a computer
            lab, or gate attendance for the first time, we can point you to the right equipment and help you set it
            up.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [CreditCard, 'ID card printing', 'Printers and blank cards to turn the digital ID cards you already generate into physical ones.'],
              [ScanLine, 'Gate scanners', 'QR/barcode scanners matched to the attendance flow, with a setup guide included.'],
              [Monitor, 'CBT lab computers', 'Entry-level lab hardware sized for computer-based testing, for schools not yet fully equipped.'],
              [Wifi, 'Network setup', 'Structured wiring and routers so the "works even offline" promise holds up on your actual campus wifi.'],
            ].map(([Icon, title, body]: any) => (
              <div key={title} className="rounded-xl border border-black/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-display text-base font-semibold">{title}</h3>
                <p className="text-sm text-ink/60">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink/50">
            Interested in any of this?{' '}
            <a href="mailto:hello@elorgeschools.com" className="text-brand-blue underline">
              Talk to us
            </a>{' '}
            — we'll advise on what actually fits your school before recommending anything.
          </p>
        </div>
      </section>

      {/* Credibility — honest, no fabricated names/testimonials */}
      <section className="border-t border-black/5 px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-ink/50">
          Built for schools that take their records seriously — from single-campus academies to multi-branch
          colleges.
        </p>
      </section>

      {/* Final CTA */}
      <section className="border-t border-black/5 bg-white px-6 py-20 text-center">
        <h2 className="mb-6 font-display text-3xl font-semibold">Ready to see it running on your own data?</h2>
        <Link
          href="/signup"
          className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
        >
          Get started
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}