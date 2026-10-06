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

const PT_REASONS = [
  { title: 'Configurar a sua escola', body: 'Integração, importação da sua lista de alunos existente, ou configuração do seu primeiro trimestre.' },
  { title: 'Algo não está a funcionar bem', body: 'Uma sincronização que não foi concluída, um leitor que não lê um cartão, qualquer coisa que pareça estranha.' },
  { title: 'Preços e o que se adequa à sua escola', body: 'Como funcionam a carteira e as taxas por aluno, e quanto uma escola do seu porte pagaria na prática.' },
];

const EN: ContactLabels = {
  kicker: 'Contact',
  heroTitle: "Let's talk.",
  heroBody: 'Questions about setting up your school, pricing, or anything else — reach out directly. A real person on our team reads every message.',
  chatOnWhatsApp: 'Chat with us live',
  reasonsHeading: 'What people usually write in about.',
  reasons: EN_REASONS,
  closingBody: "No ticket queue, no chatbot loop — just write in and someone who actually understands the platform will get back to you.",
};

const FR: ContactLabels = {
  kicker: 'Contact',
  heroTitle: 'Discutons.',
  heroBody: "Des questions sur la configuration de votre école, la tarification, ou autre chose — contactez-nous directement. Une vraie personne de notre équipe lit chaque message.",
  chatOnWhatsApp: 'Discuter en direct',
  reasonsHeading: 'Ce pour quoi les gens nous écrivent habituellement.',
  reasons: FR_REASONS,
  closingBody: "Pas de file d'attente de tickets, pas de boucle de chatbot — écrivez simplement et quelqu'un qui comprend vraiment la plateforme vous répondra.",
};

const PT: ContactLabels = {
  kicker: 'Contacto',
  heroTitle: 'Vamos conversar.',
  heroBody: 'Perguntas sobre a configuração da sua escola, preços, ou qualquer outra coisa — contacte-nos diretamente. Uma pessoa real da nossa equipa lê todas as mensagens.',
  chatOnWhatsApp: 'Conversar ao vivo',
  reasonsHeading: 'Os motivos mais comuns pelos quais nos escrevem.',
  reasons: PT_REASONS,
  closingBody: 'Sem fila de tickets, sem ciclo de chatbot — basta escrever e alguém que compreende mesmo a plataforma responderá.',
};

const ES_REASONS = [
  { title: 'Configurar su colegio', body: 'Incorporación, importación de su lista de alumnos existente, o configuración de su primer trimestre.' },
  { title: 'Algo no funciona bien', body: 'Una sincronización que no se completó, un lector que no lee una tarjeta, cualquier cosa que se vea rara.' },
  { title: 'Precios y qué se adapta a su colegio', body: 'Cómo funcionan la billetera y las tarifas por alumno, y cuánto pagaría en la práctica un colegio de su tamaño.' },
];

const ES: ContactLabels = {
  kicker: 'Contacto',
  heroTitle: 'Hablemos.',
  heroBody: 'Preguntas sobre la configuración de su colegio, precios, o cualquier otra cosa: escríbanos directamente. Una persona real de nuestro equipo lee cada mensaje.',
  chatOnWhatsApp: 'Chatear en vivo',
  reasonsHeading: 'Sobre qué suele escribirnos la gente.',
  reasons: ES_REASONS,
  closingBody: 'Sin fila de tickets, sin bucle de chatbot: solo escriba y alguien que realmente entiende la plataforma le responderá.',
};

const CONTACT_LABELS_BY_LOCALE: Record<SupportedLocale, ContactLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function contactLabelsFor(locale: string): ContactLabels {
  return CONTACT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? CONTACT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
