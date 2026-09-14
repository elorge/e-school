// web/components/marketing/ContactPageContent.tsx
'use client';

import { Mail, MessageCircle, Clock, Users2, Wrench } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { contactLabelsFor } from '@/lib/i18n/contact-labels';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const REASON_ICONS = [Users2, Wrench, Clock];

export default function ContactPageContent() {
  const { locale } = useMarketingLocale();
  const t = contactLabelsFor(locale);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-12 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.kicker}</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{t.heroTitle}</h1>
        <p className="max-w-md text-lg text-ink/70">{t.heroBody}</p>

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
              <MessageCircle size={16} /> {t.chatOnWhatsApp}
            </a>
          )}
        </div>
      </section>

      {/* What people usually write in about */}
      <section className="border-t border-black/5 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-display text-2xl font-semibold text-ink">{t.reasonsHeading}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {t.reasons.map(({ title, body }, i) => {
              const Icon = REASON_ICONS[i];
              return (
                <div key={title} className="border-l-2 border-brand-blue/20 pl-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-ink/60">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing reassurance */}
      <section className="px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-sm text-ink/50">{t.closingBody}</p>
      </section>
    </main>
  );
}
