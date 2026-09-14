// web/lib/i18n/contact-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface ContactLabels {
  kicker: string;
  heroTitle: string;
  heroBody: string;
  chatOnWhatsApp: string;
  reasonsHeading: string;
  reasons: { title: string; body: string }[];
  closingBody: string;
}

const EN_REASONS = [
  { title: 'Setting up your school', body: 'Onboarding, importing your existing student list, or getting your first term configured.' },
  { title: 'Something not working right', body: "A sync that hasn't gone through, a scanner that won't read a card, anything that looks off." },
  { title: 'Pricing and what fits your school', body: 'How the wallet and per-student charges work, and what a school your size would actually pay.' },
];

const FR_REASONS = [
  { title: 'Configurer votre école', body: "Intégration, importation de votre liste d'élèves existante, ou configuration de votre premier trimestre." },
  { title: 'Quelque chose ne fonctionne pas', body: "Une synchronisation qui n'a pas abouti, un scanner qui ne lit pas une carte, tout ce qui semble anormal." },
  { title: 'Tarification et ce qui convient à votre école', body: "Comment fonctionnent le portefeuille et les frais par élève, et ce qu'une école de votre taille paierait réellement." },
];

const EN: ContactLabels = {
  kicker: 'Contact',
  heroTitle: "Let's talk.",
  heroBody: 'Questions about setting up your school, pricing, or anything else — reach out directly. A real person on our team reads every message.',
  chatOnWhatsApp: 'Chat on WhatsApp',
  reasonsHeading: 'What people usually write in about.',
  reasons: EN_REASONS,
  closingBody: "No ticket queue, no chatbot loop — just write in and someone who actually understands the platform will get back to you.",
};

const FR: ContactLabels = {
  kicker: 'Contact',
  heroTitle: 'Discutons.',
  heroBody: "Des questions sur la configuration de votre école, la tarification, ou autre chose — contactez-nous directement. Une vraie personne de notre équipe lit chaque message.",
  chatOnWhatsApp: 'Discuter sur WhatsApp',
  reasonsHeading: 'Ce pour quoi les gens nous écrivent habituellement.',
  reasons: FR_REASONS,
  closingBody: "Pas de file d'attente de tickets, pas de boucle de chatbot — écrivez simplement et quelqu'un qui comprend vraiment la plateforme vous répondra.",
};

const CONTACT_LABELS_BY_LOCALE: Record<SupportedLocale, ContactLabels> = { en: EN, fr: FR };

export function contactLabelsFor(locale: string): ContactLabels {
  return CONTACT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? CONTACT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
