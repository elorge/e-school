// web/lib/i18n/result-entry-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface ResultEntryLabels {
  enterResults: string;
  termLabel: string;
  loading: string;
  subjectScores: string;
  subjectPlaceholder: string;
  addSubjectBtn: string;
  teachersCommentLabel: string;
  closeBtn: string;
  savingBtn: string;
  saveResultBtn: string;
  sessionExpiredError: string;
  selectTermFirstError: string;
  addAtLeastOneSubjectError: string;
  scoresRangeError: string;
  queuedNotice: string;
  savedNotice: string;
  couldNotSaveError: string;
}

const EN: ResultEntryLabels = {
  enterResults: 'Enter results',
  termLabel: 'Term',
  loading: 'Loading…',
  subjectScores: 'Subject scores',
  subjectPlaceholder: 'Subject',
  addSubjectBtn: 'Add subject',
  teachersCommentLabel: "Teacher's comment",
  closeBtn: 'Close',
  savingBtn: 'Saving…',
  saveResultBtn: 'Save result',
  sessionExpiredError: 'Session expired — please log in again.',
  selectTermFirstError: 'Select a term first.',
  addAtLeastOneSubjectError: 'Add at least one subject.',
  scoresRangeError: 'Scores must be between 0 and 100.',
  queuedNotice: 'No internet right now — saved on this device, will sync automatically.',
  savedNotice: 'Saved.',
  couldNotSaveError: 'Could not save this result.',
};

const FR: ResultEntryLabels = {
  enterResults: 'Saisir les résultats',
  termLabel: 'Trimestre',
  loading: 'Chargement…',
  subjectScores: 'Notes par matière',
  subjectPlaceholder: 'Matière',
  addSubjectBtn: 'Ajouter une matière',
  teachersCommentLabel: "Commentaire de l'enseignant",
  closeBtn: 'Fermer',
  savingBtn: 'Enregistrement…',
  saveResultBtn: 'Enregistrer le résultat',
  sessionExpiredError: 'Session expirée — veuillez vous reconnecter.',
  selectTermFirstError: "Sélectionnez d'abord un trimestre.",
  addAtLeastOneSubjectError: 'Ajoutez au moins une matière.',
  scoresRangeError: 'Les notes doivent être comprises entre 0 et 100.',
  queuedNotice: 'Pas de connexion internet pour le moment — enregistré sur cet appareil, se synchronisera automatiquement.',
  savedNotice: 'Enregistré.',
  couldNotSaveError: "Impossible d'enregistrer ce résultat.",
};

const PT: ResultEntryLabels = {
  enterResults: 'Inserir resultados',
  termLabel: 'Período',
  loading: 'A carregar…',
  subjectScores: 'Notas por disciplina',
  subjectPlaceholder: 'Disciplina',
  addSubjectBtn: 'Adicionar disciplina',
  teachersCommentLabel: 'Comentário do professor',
  closeBtn: 'Fechar',
  savingBtn: 'A guardar…',
  saveResultBtn: 'Guardar resultado',
  sessionExpiredError: 'Sessão expirada — por favor inicie sessão novamente.',
  selectTermFirstError: 'Selecione primeiro um período.',
  addAtLeastOneSubjectError: 'Adicione pelo menos uma disciplina.',
  scoresRangeError: 'As notas devem estar entre 0 e 100.',
  queuedNotice: 'Sem internet neste momento — guardado neste dispositivo, será sincronizado automaticamente.',
  savedNotice: 'Guardado.',
  couldNotSaveError: 'Não foi possível guardar este resultado.',
};

const ES: ResultEntryLabels = {
  enterResults: 'Ingresar resultados',
  termLabel: 'Trimestre',
  loading: 'Cargando…',
  subjectScores: 'Calificaciones por asignatura',
  subjectPlaceholder: 'Asignatura',
  addSubjectBtn: 'Agregar asignatura',
  teachersCommentLabel: 'Comentario del docente',
  closeBtn: 'Cerrar',
  savingBtn: 'Guardando…',
  saveResultBtn: 'Guardar resultado',
  sessionExpiredError: 'Sesión caducada; inicie sesión nuevamente.',
  selectTermFirstError: 'Seleccione primero un trimestre.',
  addAtLeastOneSubjectError: 'Agregue al menos una asignatura.',
  scoresRangeError: 'Las calificaciones deben estar entre 0 y 100.',
  queuedNotice: 'No hay conexión a internet en este momento; se guardó en este dispositivo y se sincronizará automáticamente.',
  savedNotice: 'Guardado.',
  couldNotSaveError: 'No se pudo guardar este resultado.',
};

const RESULT_ENTRY_LABELS_BY_LOCALE: Record<SupportedLocale, ResultEntryLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function resultEntryLabelsFor(locale: string): ResultEntryLabels {
  return RESULT_ENTRY_LABELS_BY_LOCALE[locale as SupportedLocale] ?? RESULT_ENTRY_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
