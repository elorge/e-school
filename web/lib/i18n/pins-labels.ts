// web/lib/i18n/pins-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface PinsLabels {
  pinsGeneratedHeading: string;
  printSheetBtn: string;
  oneTimeWarning: string;
  colStudent: string;
  colAdmissionIdPin: string;
  generateAnotherBatchBtn: string;
  pageTitle: string;
  couldNotGeneratePins: string;
  termLabel: string;
  classLabel: string;
  selectAllBtn: (count: number) => string;
  pendingId: string;
  selectedSummary: (count: number) => string;
  upTo: (amount: string) => string;
  generating: string;
  generatePinsBtn: string;
}

const EN: PinsLabels = {
  pinsGeneratedHeading: 'PINs generated',
  printSheetBtn: 'Print sheet',
  oneTimeWarning: 'These PINs are shown once and never stored in plaintext or emailed — write them down or print this page now.',
  colStudent: 'Student',
  colAdmissionIdPin: 'Admission ID / PIN',
  generateAnotherBatchBtn: 'Generate another batch',
  pageTitle: 'Generate Result PINs',
  couldNotGeneratePins: 'Could not generate PINs — check wallet balance',
  termLabel: 'Term',
  classLabel: 'Class',
  selectAllBtn: (count) => `Select all (${count})`,
  pendingId: 'pending ID',
  selectedSummary: (count) => `${count} student(s) selected — students already charged for this term (via PIN or CBT) are not billed again.`,
  upTo: (amount) => `Up to ${amount}`,
  generating: 'Generating…',
  generatePinsBtn: 'Generate PINs',
};

const FR: PinsLabels = {
  pinsGeneratedHeading: 'Codes PIN générés',
  printSheetBtn: 'Imprimer la feuille',
  oneTimeWarning: "Ces codes PIN ne s'affichent qu'une seule fois et ne sont jamais enregistrés en clair ni envoyés par e-mail — notez-les ou imprimez cette page maintenant.",
  colStudent: 'Élève',
  colAdmissionIdPin: 'Matricule / Code PIN',
  generateAnotherBatchBtn: 'Générer un autre lot',
  pageTitle: 'Générer des codes PIN de résultats',
  couldNotGeneratePins: 'Impossible de générer les codes PIN — vérifiez le solde du portefeuille',
  termLabel: 'Trimestre',
  classLabel: 'Classe',
  selectAllBtn: (count) => `Tout sélectionner (${count})`,
  pendingId: 'matricule en attente',
  selectedSummary: (count) => `${count} élève(s) sélectionné(s) — les élèves déjà facturés pour ce trimestre (via PIN ou CBT) ne sont pas facturés à nouveau.`,
  upTo: (amount) => `Jusqu'à ${amount}`,
  generating: 'Génération…',
  generatePinsBtn: 'Générer les codes PIN',
};

const PINS_LABELS_BY_LOCALE: Record<SupportedLocale, PinsLabels> = {
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

export function pinsLabelsFor(locale: string): PinsLabels {
  return PINS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? PINS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
