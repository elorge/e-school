// web/app/careers/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Mail, Wifi, Users2, Puzzle, MessageSquare, Handshake, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers at Elorge Technologies',
  description:
    'Join the team building school management software for Nigerian schools — engineering, education, and operations roles.',
  alternates: { canonical: '/careers' },
};

// TODO: replace with real open roles as they come up. Kept honest and
// empty rather than inventing job postings — a fake listing is a bad
// first impression for anyone who takes it seriously enough to apply.
const OPEN_ROLES: { title: string; type: string }[] = [];

const WHY_ELORGE = [
  {
    icon: Puzzle,
    title: 'Real problems, not busywork',
    body: "Every feature we ship exists because a registrar's office, a gate scanner, or a parent with a report card actually needed it. You'll never spend a sprint on something invented to fill a roadmap.",
  },
  {
    icon: Wifi,
    title: 'Engineering that has to hold up offline',
    body: "NEPA cuts the power mid-registration season, and the platform still has to work. If you like problems with a real-world constraint attached — not just a clean spec — this is that kind of team.",
  },
  {
    icon: Users2,
    title: 'Small enough to matter',
    body: "We're a small, deliberately assembled team. What you build ships to real schools within weeks, not after a year of committee review.",
  },
];

const HOW_WE_HIRE = [
  {
    icon: MessageSquare,
    title: 'Say hello',
    body: "Send us a note about who you are and what you'd want to work on — no formal application, no cover letter template to fight with.",
  },
  {
    icon: Handshake,
    title: 'A real conversation',
    body: "We talk through what we're building, where you'd fit, and whether it's a genuine match — for you as much as for us.",
  },
  {
    icon: Sparkles,
    title: 'A working session, not a whiteboard test',
    body: "If it looks like a fit, we work through something close to a real problem together, so you get an honest look at the job before committing to it.",
  },
];

export default function CareersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Careers</p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Build the software Nigerian schools actually need.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            Elorge Technologies Limited is a small, focused team building school-management software and IT
            infrastructure. We're not a large company with a formal recruiting pipeline — but if what we're building
            resonates with you, we'd like to hear from you.
          </p>
        </section>

        {/* Why Elorge */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">Why people work here.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {WHY_ELORGE.map(({ icon: Icon, title, body }) => (
                <div key={title} className="border-l-2 border-brand-blue/20 pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How we hire */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">No black-box process</p>
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">
              What actually happens after you reach out.
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {HOW_WE_HIRE.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
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

        {/* Open roles */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Open roles</h2>
            {OPEN_ROLES.length > 0 ? (
              <div className="mb-10 flex flex-col gap-3">
                {OPEN_ROLES.map((role) => (
                  <div key={role.title} className="card flex items-center justify-between">
                    <span className="font-medium">{role.title}</span>
                    <span className="badge badge-blue">{role.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card mb-10">
                <p className="text-sm text-ink/60">
                  We don't have specific open roles listed right now. That doesn't mean we're not interested in
                  hearing from good people — if you're excited about education technology in Nigeria, reach out
                  anyway. We keep a running list of everyone who's written in, and we go back to it first when a
                  role does open up.
                </p>
              </div>
            )}
            <a
              href="mailto:hello@elorgeschools.com?subject=Interested in joining Elorge"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Mail size={16} /> Email us
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}