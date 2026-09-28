// web/lib/i18n/results-labels.ts
/**
 * Every fixed UI string on the public result-checking page
 * (app/[school]/results/page.tsx) — a parent's Admission ID/PIN lookup
 * and the on-screen report view. Subject names and the teacher's own
 * comment text are never translated here — only the platform's chrome.
 */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface ResultsLabels {
  checkYourResult: string;
  admissionIdLabel: string;
  pinLabel: string;
  checking: string;
  viewResult: string;
  genericError: string;
  checkAnotherResult: string;
  print: string;
  downloadPdf: string;
  subjectScores: string;
  loadingPrintable: string;
  couldNotLoadPrintable: (message: string) => string;
}

const EN: ResultsLabels = {
  checkYourResult: 'Check your result',
  admissionIdLabel: 'Admission ID',
  pinLabel: 'PIN',
  checking: 'Checking…',
  viewResult: 'View result',
  genericError: 'Something went wrong. Please try again.',
  checkAnotherResult: 'Check another result',
  print: 'Print',
  downloadPdf: 'Download PDF',
  subjectScores: 'Subject Scores',
  loadingPrintable: 'Loading printable report card…',
  couldNotLoadPrintable: (message) => `Could not load the printable report card: ${message}`,
};

const FR: ResultsLabels = {
  checkYourResult: 'Consultez votre résultat',
  admissionIdLabel: 'Matricule',
  pinLabel: 'Code PIN',
  checking: 'Vérification…',
  viewResult: 'Voir le résultat',
  genericError: "Une erreur s'est produite. Veuillez réessayer.",
  checkAnotherResult: 'Vérifier un autre résultat',
  print: 'Imprimer',
  downloadPdf: 'Télécharger le PDF',
  subjectScores: 'Notes par matière',
  loadingPrintable: 'Chargement du bulletin imprimable…',
  couldNotLoadPrintable: (message) => `Impossible de charger le bulletin imprimable : ${message}`,
};

const PT: ResultsLabels = {
  checkYourResult: 'Consulte o seu resultado',
  admissionIdLabel: 'Número de matrícula',
  pinLabel: 'PIN',
  checking: 'A verificar…',
  viewResult: 'Ver resultado',
  genericError: 'Ocorreu um erro. Por favor, tente novamente.',
  checkAnotherResult: 'Consultar outro resultado',
  print: 'Imprimir',
  downloadPdf: 'Descarregar PDF',
  subjectScores: 'Notas por Disciplina',
  loadingPrintable: 'A carregar boletim imprimível…',
  couldNotLoadPrintable: (message) => `Não foi possível carregar o boletim imprimível: ${message}`,
};

const ES: ResultsLabels = {
  checkYourResult: 'Consulte su resultado',
  admissionIdLabel: 'Número de matrícula',
  pinLabel: 'PIN',
  checking: 'Verificando…',
  viewResult: 'Ver resultado',
  genericError: 'Ocurrió un error. Inténtelo de nuevo.',
  checkAnotherResult: 'Consultar otro resultado',
  print: 'Imprimir',
  downloadPdf: 'Descargar PDF',
  subjectScores: 'Calificaciones por asignatura',
  loadingPrintable: 'Cargando boleta imprimible…',
  couldNotLoadPrintable: (message) => `No se pudo cargar la boleta imprimible: ${message}`,
};

const RESULTS_LABELS_BY_LOCALE: Record<SupportedLocale, ResultsLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function resultsLabelsFor(locale: string): ResultsLabels {
  return RESULTS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? RESULTS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
