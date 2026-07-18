// web/app/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Linkedin, ShieldCheck, Wifi, Users2 } from 'lucide-react';

// TODO: replace with your real team. Add each person's photo to
// web/public/team/ and point `photo` at it — leave `photo: null` for
// anyone without one yet, and their initials show instead.
// Replace each `linkedin: '#'` with the person's actual profile URL.
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  linkedin: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'George Olumah',
    role: 'Founder',
    bio: "George holds a BSc in Mathematics, a BASc in Software Development (in view) from BYU–Idaho, a project management qualification from UC Irvine, and studied Entrepreneurial Management at the Lagos Business School, Pan-Atlantic University. He built Elorge around a simple conviction: that a school's records — results, IDs, fees — deserve the same rigor as the classrooms producing them. He's happiest solving the unglamorous problem nobody else wanted to touch.",
    photo: '/team/founder.jpg',
    linkedin: '#',
  },
  {
    name: 'Elohor Olumah',
    role: 'Co-Founder',
    bio: "Elohor holds a Master's in Engineering from the University of Benin. A deep, deliberate thinker, she brings a strategist's patience to problems most people want to rush past — tracing a decision back to its root before ever proposing a fix. That instinct shapes how Elorge is built: solid underneath, not just fast to ship.",
    photo: '/team/elohor.jpg',
    linkedin: '#',
  },
  {
    name: 'Gordon Ekpuyama',
    role: 'MD/CEO',
    bio: "Gordon holds a PhD in Education from the University of Ibadan. Few people building school software have spent as much time inside the actual dynamics of a Nigerian classroom, staffroom, and registrar's office — and it shows in how uncompromising he is about the platform reflecting how schools really work, not how software usually assumes they do.",
    photo: '/team/team.jpg',
    linkedin: '#',
  },
  {
    name: 'Victor Oko',
    role: 'CTO',
    bio: "Victor holds a Master's in Data Science and AI from the University of Hull. An AI software engineer with a deep understanding of core system architecture, he's the one responsible for Elorge working the way it's promised to — including offline, in a blackout, on a phone with three bars and no signal to spare.",
    photo: '/team/team.jpg',
    linkedin: '#',
  },
  {
    name: 'Shelter Orok',
    role: 'CISO',
    bio: "Shelter holds a Master's in Applied Cyber Security from Heriot-Watt University and has worked as a fraud prevention analyst. He's the reason a parent's PIN, a student's record, and a school's finances stay exactly as private as they're supposed to be — and the first person who'd tell you if they didn't.",
    photo: '/team/team.jpg',
    linkedin: '#',
  },
  {
    name: 'Mamus Benita',
    role: 'Legal Consultant',
    bio: "Mamus holds an LLM in Law from the University of Benin. She keeps Elorge's contracts, data-handling practices, and school agreements built on solid legal ground — so every school we work with knows exactly what they're signing, and exactly what we're accountable for.",
    photo: '/team/mamus.jpg',
    linkedin: '#',
  },
  // Add more team members here, same shape.
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Records worth trusting',
    body: "We started with a QR-verifiable report card for one reason: a parent shouldn't have to take a school's word for a result. Everything else we've built holds itself to that same standard.",
  },
  {
    icon: Wifi,
    title: 'Built for how schools actually run',
    body: "NEPA cuts the power mid-registration season. Signal drops at the gate. We designed for that reality first, not as an afterthought bolted on once something broke in front of a client.",
  },
  {
    icon: Users2,
    title: 'A team that answers the phone',
    body: "We're a small, deliberately assembled team — education, engineering, security, and law all in the room — not a support queue. When a school writes in, someone who actually understands the platform responds.",
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">About Elorge</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            A record your parents don't have to take your word for.
          </h1>
          <p className="max-w-xl text-lg text-ink/70">
            Elorge Technologies Limited builds software for schools that take their records seriously — results
            parents can verify, ID cards that work at the gate, and a wallet that doesn't need a finance degree to
            understand.
          </p>
        </section>

        {/* Story */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Why we exist</p>
              <h2 className="mb-4 font-display text-3xl font-semibold">
                We build the registrar's office nobody has time to build for themselves.
              </h2>
              <p className="mb-4 text-ink/70">
                Elorge began with a single, stubborn question: why should a parent ever have to wonder if a report
                card is genuine? That question led to a QR-verifiable result — and once we'd solved it properly, it
                became obvious the same rigor was missing everywhere else in a school's daily record-keeping: at the
                gate, in the fees office, in a computer lab that loses signal mid-test.
              </p>
              <p className="text-ink/70">
                We're a Nigerian software company focused on IT infrastructure and development for the education
                sector — small enough that the people who built the platform still answer the phone when a school
                calls, and deliberate enough that every feature earns its place because a real registrar's office
                actually needed it.
              </p>
            </div>
            <div className="rounded-2xl bg-ink p-8 text-white torn-edge">
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">In numbers</p>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-display text-3xl font-semibold">1</p>
                  <p className="text-sm text-white/60">login for results, IDs, fees, and testing — no separate systems to reconcile</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold">0</p>
                  <p className="text-sm text-white/60">signal required to register a student, enter a score, or sit a test</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold">3</p>
                  <p className="text-sm text-white/60">disciplines in the founding team — education, engineering, and security — not just one</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">What we hold ourselves to.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {VALUES.map(({ icon: Icon, title, body }) => (
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

        {/* Team */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-green">The people behind it</p>
            <h2 className="mb-12 max-w-lg font-display text-3xl font-semibold text-ink">
              Education, engineering, security, and law — in the same room.
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {TEAM.map((member) => (
                <div key={member.name} className="card flex flex-col gap-4 p-6 sm:flex-row">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={112}
                      height={112}
                      className="h-28 w-28 shrink-0 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-2xl font-semibold text-brand-blue shadow-md">
                      {initials(member.name)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold">{member.name}</p>
                      <Link
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="text-ink/40 transition hover:text-brand-blue"
                      >
                        <Linkedin size={16} />
                      </Link>
                    </div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-brand-green">{member.role}</p>
                    <p className="text-sm leading-relaxed text-ink/60">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-black/5 px-6 py-20 text-center">
          <h2 className="mb-4 font-display text-3xl font-semibold">Want to talk to the team directly?</h2>
          <p className="mx-auto mb-6 max-w-md text-ink/60">
            We're a small enough team that a real conversation is always on the table — before you sign up, not
            just after something goes wrong.
          </p>
          <a
            href="mailto:hello@elorgeschools.com"
            className="inline-block rounded-full bg-brand-blue px-8 py-3 font-medium text-white transition hover:bg-brand-blue-dark"
          >
            Talk to us
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}