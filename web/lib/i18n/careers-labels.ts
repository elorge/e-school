// web/lib/i18n/careers-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface CareersLabels {
  kicker: string;
  heroTitle: string;
  heroBody: string;
  whyHeading: string;
  whyElorge: { title: string; body: string }[];
  hireKicker: string;
  hireHeading: string;
  howWeHire: { title: string; body: string }[];
  openRolesHeading: string;
  noOpenRolesBody: string;
  emailUs: string;
}

const EN_WHY = [
  { title: 'Real problems, not busywork', body: "Every feature we ship exists because a registrar's office, a gate scanner, or a parent with a report card actually needed it. You'll never spend a sprint on something invented to fill a roadmap." },
  { title: 'Engineering that has to hold up offline', body: "NEPA cuts the power mid-registration season, and the platform still has to work. If you like problems with a real-world constraint attached — not just a clean spec — this is that kind of team." },
  { title: 'Small enough to matter', body: "We're a small, deliberately assembled team. What you build ships to real schools within weeks, not after a year of committee review." },
];

const FR_WHY = [
  { title: 'De vrais problèmes, pas des tâches inutiles', body: "Chaque fonctionnalité que nous livrons existe parce qu'un secrétariat scolaire, un scanner de portail, ou un parent avec un bulletin en avait réellement besoin. Vous ne passerez jamais un sprint sur quelque chose inventé pour remplir une feuille de route." },
  { title: "Une ingénierie qui doit tenir hors ligne", body: "Le courant coupe en pleine saison d'inscription, et la plateforme doit quand même fonctionner. Si vous aimez les problèmes avec une vraie contrainte du monde réel — pas juste un cahier des charges propre — c'est ce genre d'équipe." },
  { title: 'Assez petite pour compter', body: "Nous sommes une petite équipe assemblée avec soin. Ce que vous construisez arrive chez de vraies écoles en quelques semaines, pas après un an de revue en comité." },
];

const EN_HOW_WE_HIRE = [
  { title: 'Say hello', body: "Send us a note about who you are and what you'd want to work on — no formal application, no cover letter template to fight with." },
  { title: 'A real conversation', body: "We talk through what we're building, where you'd fit, and whether it's a genuine match — for you as much as for us." },
  { title: 'A working session, not a whiteboard test', body: "If it looks like a fit, we work through something close to a real problem together, so you get an honest look at the job before committing to it." },
];

const FR_HOW_WE_HIRE = [
  { title: 'Dites bonjour', body: "Envoyez-nous un mot sur qui vous êtes et sur quoi vous aimeriez travailler — pas de candidature formelle, pas de modèle de lettre de motivation à affronter." },
  { title: 'Une vraie conversation', body: "Nous discutons de ce que nous construisons, où vous pourriez vous intégrer, et si c'est une vraie correspondance — pour vous autant que pour nous." },
  { title: 'Une session de travail, pas un test au tableau blanc', body: "Si ça semble correspondre, nous travaillons ensemble sur quelque chose de proche d'un vrai problème, pour que vous ayez un aperçu honnête du poste avant de vous engager." },
];

const EN: CareersLabels = {
  kicker: 'Careers',
  heroTitle: 'Build the software Nigerian schools actually need.',
  heroBody: "Elorge Technologies Limited is a small, focused team building school-management software and IT infrastructure. We're not a large company with a formal recruiting pipeline — but if what we're building resonates with you, we'd like to hear from you.",
  whyHeading: 'Why people work here.',
  whyElorge: EN_WHY,
  hireKicker: 'No black-box process',
  hireHeading: 'What actually happens after you reach out.',
  howWeHire: EN_HOW_WE_HIRE,
  openRolesHeading: 'Open roles',
  noOpenRolesBody: "We don't have specific open roles listed right now. That doesn't mean we're not interested in hearing from good people — if you're excited about education technology in Nigeria, reach out anyway. We keep a running list of everyone who's written in, and we go back to it first when a role does open up.",
  emailUs: 'Email us',
};

const FR: CareersLabels = {
  kicker: 'Carrières',
  heroTitle: 'Construisez le logiciel dont les écoles nigérianes ont vraiment besoin.',
  heroBody: "Elorge Technologies Limited est une petite équipe concentrée qui construit des logiciels de gestion scolaire et de l'infrastructure informatique. Nous ne sommes pas une grande entreprise avec un processus de recrutement formel — mais si ce que nous construisons vous parle, nous aimerions avoir de vos nouvelles.",
  whyHeading: 'Pourquoi on travaille ici.',
  whyElorge: FR_WHY,
  hireKicker: 'Aucun processus en boîte noire',
  hireHeading: 'Ce qui se passe réellement après votre prise de contact.',
  howWeHire: FR_HOW_WE_HIRE,
  openRolesHeading: 'Postes ouverts',
  noOpenRolesBody: "Nous n'avons pas de postes spécifiques ouverts pour le moment. Cela ne veut pas dire que nous ne sommes pas intéressés par de bonnes personnes — si les technologies éducatives au Nigeria vous passionnent, écrivez-nous quand même. Nous gardons une liste de toutes les personnes qui nous ont écrit, et nous y retournons en premier quand un poste s'ouvre.",
  emailUs: 'Nous écrire',
};

const CAREERS_LABELS_BY_LOCALE: Record<SupportedLocale, CareersLabels> = {
  en: EN,
  fr: FR,
  // TODO: translate to Portuguese. Falls back to English for now so
  // Portuguese-speaking schools (e.g. Mozambique, Angola) get a
  // working, correctly-worded product immediately rather than a
  // rushed/incorrect machine translation of operational and
  // financial terminology. Prioritize replacing this over the
  // already-translated marketing/legal/nav/footer/login/report-card
  // strings, which speak to prospective customers and parents first.
  pt: EN,
};

export function careersLabelsFor(locale: string): CareersLabels {
  return CAREERS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? CAREERS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
