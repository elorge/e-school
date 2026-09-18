// web/lib/i18n/results-marketing-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface ResultsMarketingLabels {
  kicker: string;
  heroTitle: string;
  heroBody: string;
  noteBody: string;
  howItWorksHeading: string;
  howItWorks: { title: string; body: string }[];
  faqHeading: string;
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
}

const EN_HOW_IT_WORKS = [
  { title: "Go to your school's Elorge page", body: "Your school gives you a web address specific to them — something like elorgeschools.org/yourschool/results." },
  { title: 'Enter the Admission ID and result PIN', body: "Both are issued by the school. No account or password to create — just the two codes tied to your child's record." },
  { title: 'See a verified, QR-stamped report card', body: "Every result carries a QR code you or anyone else can scan to confirm it's the genuine record on file — not a doubtful photocopy." },
];

const FR_HOW_IT_WORKS = [
  { title: "Rendez-vous sur la page Elorge de votre école", body: "Votre école vous donne une adresse web qui lui est propre — quelque chose comme elorgeschools.org/votreecole/results." },
  { title: 'Saisissez le matricule et le code PIN de résultat', body: "Les deux sont délivrés par l'école. Aucun compte ni mot de passe à créer — juste les deux codes liés au dossier de votre enfant." },
  { title: 'Consultez un bulletin vérifié et estampillé QR', body: "Chaque résultat porte un code QR que vous ou n'importe qui pouvez scanner pour confirmer qu'il s'agit du dossier authentique — pas d'une photocopie douteuse." },
];

const EN_FAQS = [
  { q: "How do I check my child's school result online?", a: 'Your school provides a results link specific to them, plus an Admission ID and result PIN for your child. Enter both on that page to see a verified report card — no account needed.' },
  { q: 'What is a result PIN and where do I get one?', a: "A result PIN is a code your school issues per term to unlock a student's report card online. Contact your school's admin office if you don't have one." },
  { q: 'How can I tell if a result is genuine?', a: "Every Elorge report card carries a QR stamp. Scanning it confirms the result matches the record on file at the school — so a result can't be altered or faked after the fact." },
  { q: "My school isn't on Elorge yet — can I still check a result here?", a: "No — results are specific to each school's own Elorge workspace. If your school hasn't signed up, ask them, or share this page with your school's administration." },
];

const FR_FAQS = [
  { q: 'Comment vérifier le résultat scolaire de mon enfant en ligne ?', a: "Votre école fournit un lien de résultats qui lui est propre, ainsi qu'un matricule et un code PIN de résultat pour votre enfant. Saisissez les deux sur cette page pour voir un bulletin vérifié — aucun compte requis." },
  { q: "Qu'est-ce qu'un code PIN de résultat et où puis-je en obtenir un ?", a: "Un code PIN de résultat est un code que votre école délivre par trimestre pour déverrouiller le bulletin d'un élève en ligne. Contactez le secrétariat de votre école si vous n'en avez pas." },
  { q: "Comment savoir si un résultat est authentique ?", a: "Chaque bulletin Elorge porte un code QR. Le scanner confirme que le résultat correspond au dossier enregistré à l'école — un résultat ne peut donc pas être modifié ou falsifié après coup." },
  { q: "Mon école n'est pas encore sur Elorge — puis-je quand même vérifier un résultat ici ?", a: "Non — les résultats sont propres à l'espace de travail Elorge de chaque école. Si votre école ne s'est pas encore inscrite, demandez-lui, ou partagez cette page avec son administration." },
];

const EN: ResultsMarketingLabels = {
  kicker: 'Check a result',
  heroTitle: "A result you don't have to take anyone's word for.",
  heroBody: "Every report card issued through Elorge carries a QR stamp a parent can scan to confirm it's real. Here's how checking a result actually works.",
  noteBody: 'This page explains how result checking works — it isn\'t itself a results portal. Your specific school gives you a link like elorgeschools.org/yourschool/results, along with an Admission ID and PIN for your child.',
  howItWorksHeading: 'Three steps, no account required.',
  howItWorks: EN_HOW_IT_WORKS,
  faqHeading: 'Common questions about checking a result.',
  faqs: EN_FAQS,
  ctaHeading: 'Is your school on Elorge yet?',
  ctaBody: "If your school hasn't set up verified results, ID cards, and CBT yet, point them here.",
  ctaButton: 'Bring your school onto Elorge',
};

const FR: ResultsMarketingLabels = {
  kicker: 'Vérifier un résultat',
  heroTitle: "Un résultat que vous n'avez à croire sur la parole de personne.",
  heroBody: "Chaque bulletin délivré via Elorge porte un code QR qu'un parent peut scanner pour confirmer son authenticité. Voici comment fonctionne réellement la vérification d'un résultat.",
  noteBody: "Cette page explique comment fonctionne la vérification des résultats — elle n'est pas elle-même un portail de résultats. Votre école vous donne un lien du type elorgeschools.org/votreecole/results, ainsi qu'un matricule et un code PIN pour votre enfant.",
  howItWorksHeading: 'Trois étapes, aucun compte requis.',
  howItWorks: FR_HOW_IT_WORKS,
  faqHeading: 'Questions fréquentes sur la vérification d\'un résultat.',
  faqs: FR_FAQS,
  ctaHeading: 'Votre école est-elle déjà sur Elorge ?',
  ctaBody: "Si votre école n'a pas encore mis en place les résultats vérifiés, les cartes d'identité et le CBT, orientez-la ici.",
  ctaButton: 'Rejoindre Elorge avec votre école',
};

const RESULTS_MARKETING_LABELS_BY_LOCALE: Record<SupportedLocale, ResultsMarketingLabels> = {
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

export function resultsMarketingLabelsFor(locale: string): ResultsMarketingLabels {
  return RESULTS_MARKETING_LABELS_BY_LOCALE[locale as SupportedLocale] ?? RESULTS_MARKETING_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
