// web/lib/i18n/session-wrap-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface SessionWrapLabels {
  sessionWrap: string;
  termsOnFile: (count: number) => string;
  fieldsWorthExploring: string;
  // Staff generator page
  pageTitle: string;
  studentLabel: string;
  selectStudent: string;
  academicSessionLabel: string;
  selectSession: string;
  generate: string;
  generating: string;
  loadFailed: string;
  noResultsFound: string;
  downloadAsPdf: string;
  // Public parent-facing page
  yourChildsSessionWrap: string;
  publicIntro: string;
  admissionIdLabel: string;
  pinLabel: string;
  checking: string;
  viewSessionWrap: string;
  genericError: string;
}

const EN: SessionWrapLabels = {
  sessionWrap: 'Session Wrap',
  termsOnFile: (count) => `${count} term(s) on file`,
  fieldsWorthExploring: 'Fields worth exploring',
  pageTitle: 'Session Wrap',
  studentLabel: 'Student',
  selectStudent: 'Select a student',
  academicSessionLabel: 'Academic session',
  selectSession: 'Select a session',
  generate: 'Generate',
  generating: 'Generating…',
  loadFailed: 'Failed to load students/sessions',
  noResultsFound: 'No results found for this student in that session yet.',
  downloadAsPdf: 'Download as PDF',
  yourChildsSessionWrap: "Your child's Session Wrap",
  publicIntro: "Use your child's current result PIN — you'll see every term on file so far this session, even if it's just one.",
  admissionIdLabel: 'Admission ID',
  pinLabel: 'PIN',
  checking: 'Checking…',
  viewSessionWrap: 'View Session Wrap',
  genericError: 'Something went wrong. Please try again.',
};

const FR: SessionWrapLabels = {
  sessionWrap: "Bilan de l'année",
  termsOnFile: (count) => `${count} trimestre(s) enregistré(s)`,
  fieldsWorthExploring: 'Filières à explorer',
  pageTitle: "Bilan de l'année",
  studentLabel: 'Élève',
  selectStudent: 'Sélectionner un élève',
  academicSessionLabel: 'Année académique',
  selectSession: 'Sélectionner une année',
  generate: 'Générer',
  generating: 'Génération…',
  loadFailed: 'Échec du chargement des élèves/années',
  noResultsFound: 'Aucun résultat trouvé pour cet élève sur cette année pour le moment.',
  downloadAsPdf: 'Télécharger en PDF',
  yourChildsSessionWrap: "Le bilan de l'année de votre enfant",
  publicIntro: "Utilisez le code PIN de résultat actuel de votre enfant — vous verrez chaque trimestre enregistré cette année, même s'il n'y en a qu'un.",
  admissionIdLabel: 'Matricule',
  pinLabel: 'Code PIN',
  checking: 'Vérification…',
  viewSessionWrap: "Voir le bilan de l'année",
  genericError: "Une erreur s'est produite. Veuillez réessayer.",
};

const SESSION_WRAP_LABELS_BY_LOCALE: Record<SupportedLocale, SessionWrapLabels> = {
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

export function sessionWrapLabelsFor(locale: string): SessionWrapLabels {
  return SESSION_WRAP_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SESSION_WRAP_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
