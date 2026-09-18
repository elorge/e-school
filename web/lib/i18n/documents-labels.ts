// web/lib/i18n/documents-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface DocumentsLabels {
  pageTitle: string;
  loadFailed: string;
  genericDownloadError: string;
  studentDocumentsHeading: string;
  studentLabel: string;
  selectStudent: string;
  pendingId: string;
  termLabel: string;
  selectTerm: string;
  issueIdCardBtn: string;
  couldNotIssueIdCard: string;
  idCardPdfBtn: string;
  noIdCardYetError: string;
  reportCardPdfBtn: string;
  generating: string;
  termDocumentsHeading: string;
  termCalendarPdfBtn: string;
}

const EN: DocumentsLabels = {
  pageTitle: 'Documents',
  loadFailed: 'Failed to load students/terms',
  genericDownloadError: 'Could not generate that document. Check your selection and try again.',
  studentDocumentsHeading: 'Student documents',
  studentLabel: 'Student',
  selectStudent: 'Select a student',
  pendingId: 'pending ID',
  termLabel: 'Term',
  selectTerm: 'Select a term',
  issueIdCardBtn: 'Issue ID card',
  couldNotIssueIdCard: 'Could not issue ID card',
  idCardPdfBtn: 'ID card PDF',
  noIdCardYetError: 'No ID card on file yet for this student — click "Issue ID card" first.',
  reportCardPdfBtn: 'Report card PDF',
  generating: 'Generating…',
  termDocumentsHeading: 'Term documents',
  termCalendarPdfBtn: 'Term calendar PDF',
};

const FR: DocumentsLabels = {
  pageTitle: 'Documents',
  loadFailed: 'Échec du chargement des élèves/trimestres',
  genericDownloadError: 'Impossible de générer ce document. Vérifiez votre sélection et réessayez.',
  studentDocumentsHeading: "Documents de l'élève",
  studentLabel: 'Élève',
  selectStudent: 'Sélectionner un élève',
  pendingId: 'matricule en attente',
  termLabel: 'Trimestre',
  selectTerm: 'Sélectionner un trimestre',
  issueIdCardBtn: "Émettre la carte d'identité",
  couldNotIssueIdCard: "Impossible d'émettre la carte d'identité",
  idCardPdfBtn: "PDF carte d'identité",
  noIdCardYetError: 'Aucune carte d\'identité enregistrée pour cet élève — cliquez d\'abord sur « Émettre la carte d\'identité ».',
  reportCardPdfBtn: 'PDF bulletin scolaire',
  generating: 'Génération…',
  termDocumentsHeading: 'Documents du trimestre',
  termCalendarPdfBtn: 'PDF calendrier du trimestre',
};

const PT: DocumentsLabels = {
  pageTitle: 'Documentos',
  loadFailed: 'Falha ao carregar alunos/períodos',
  genericDownloadError: 'Não foi possível gerar esse documento. Verifique a sua seleção e tente novamente.',
  studentDocumentsHeading: 'Documentos do aluno',
  studentLabel: 'Aluno',
  selectStudent: 'Selecione um aluno',
  pendingId: 'matrícula pendente',
  termLabel: 'Período',
  selectTerm: 'Selecione um período',
  issueIdCardBtn: 'Emitir cartão de identificação',
  couldNotIssueIdCard: 'Não foi possível emitir o cartão de identificação',
  idCardPdfBtn: 'PDF do cartão de identificação',
  noIdCardYetError: 'Ainda não há cartão de identificação registado para este aluno — clique primeiro em "Emitir cartão de identificação".',
  reportCardPdfBtn: 'PDF do boletim escolar',
  generating: 'A gerar…',
  termDocumentsHeading: 'Documentos do período',
  termCalendarPdfBtn: 'PDF do calendário do período',
};

const DOCUMENTS_LABELS_BY_LOCALE: Record<SupportedLocale, DocumentsLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
};

export function documentsLabelsFor(locale: string): DocumentsLabels {
  return DOCUMENTS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? DOCUMENTS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
