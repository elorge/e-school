// web/app/contact/page.tsx
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Mail, MessageCircle, Clock, Users2, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Elorge Schools',
  description:
    'Get in touch about setting up your school on Elorge, pricing, or support — email or WhatsApp, a real person replies.',
  alternates: { canonical: '/contact' },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const REASONS_TO_WRITE = [
  {
    icon: Users2,
    title: 'Setting up your school',
    body: 'Onboarding, importing your existing student list, or getting your first term configured.',
  },
  {
    icon: Wrench,
    title: 'Something not working right',
    body: 'A sync that hasn\'t gone through, a scanner that won\'t read a card, anything that looks off.',
  },
  {
    icon: Clock,
    title: 'Pricing and what fits your school',
    body: 'How the wallet and per-student charges work, and what a school your size would actually pay.',
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-12 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Contact</p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">Let's talk.</h1>
          <p className="max-w-md text-lg text-ink/70">
            Questions about setting up your school, pricing, or anything else — reach out directly. A real person on
            our team reads every message.
          </p>

          <div className="flex w-full max-w-xs flex-col gap-3 pt-4">
            <a href="mailto:hello@elorgeschools.com" className="btn-primary flex items-center justify-center gap-2">
              <Mail size={16} /> hello@elorgeschools.com
            </a>
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            )}
          </div>
        </section>

        {/* What people usually write in about */}
        <section className="border-t border-black/5 bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-display text-2xl font-semibold text-ink">
              What people usually write in about.
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {REASONS_TO_WRITE.map(({ icon: Icon, title, body }) => (
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

        {/* Closing reassurance */}
        <section className="px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-ink/50">
            No ticket queue, no chatbot loop — just write in and someone who actually understands the platform will
            get back to you.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}