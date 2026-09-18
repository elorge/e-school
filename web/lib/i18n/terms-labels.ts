// web/lib/i18n/terms-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface TermsLabels {
  pageTitle: string;
  loadFailed: string;
  createHeading: string;
  createHelp: string;
  academicSessionLabel: string;
  periodLabelLabel: string;
  numberLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  createBtn: (periodLabel: string) => string;
  createError: string;
  allTermsHeading: string;
}

const EN: TermsLabels = {
  pageTitle: 'Terms',
  loadFailed: 'Failed to load terms',
  createHeading: 'Create a term',
  createHelp: 'Academic session groups every period together — e.g. "2025/2026" — and is what powers Session Wrap. Whatever your school calls its periods (Term, Semester, Quarter, Trimester) and however many you run per session, this works — the number just needs to be unique within one session.',
  academicSessionLabel: 'Academic session',
  periodLabelLabel: 'What you call a period',
  numberLabel: 'Number',
  startDateLabel: 'Start date',
  endDateLabel: 'End date',
  createBtn: (periodLabel) => `Create ${periodLabel || 'term'}`,
  createError: "Could not create term — check the session/number isn't already used",
  allTermsHeading: 'All terms',
};

const FR: TermsLabels = {
  pageTitle: 'Trimestres',
  loadFailed: 'Échec du chargement des trimestres',
  createHeading: 'Créer une période',
  createHelp: 'L\'année académique regroupe chaque période — par ex. « 2025/2026 » — et alimente le Bilan de l\'année. Que votre école les appelle Trimestres, Semestres ou autre, et quel que soit leur nombre par année, cela fonctionne — le numéro doit juste être unique au sein d\'une même année.',
  academicSessionLabel: 'Année académique',
  periodLabelLabel: 'Comment vous appelez une période',
  numberLabel: 'Numéro',
  startDateLabel: 'Date de début',
  endDateLabel: 'Date de fin',
  createBtn: (periodLabel) => `Créer ${periodLabel || 'la période'}`,
  createError: "Impossible de créer cette période — vérifiez que l'année/le numéro n'est pas déjà utilisé",
  allTermsHeading: 'Toutes les périodes',
};

const TERMS_LABELS_BY_LOCALE: Record<SupportedLocale, TermsLabels> = {
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

export function termsLabelsFor(locale: string): TermsLabels {
  return TERMS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? TERMS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
