// web/lib/i18n/staff-roster-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface StaffRosterLabels {
  pageTitle: string;
  loadClassesTermsFailed: string;
  loadStudentsFailed: string;
  classesAndStudentsHeading: string;
  allClasses: string;
  pendingId: string;
  enterResultsTitle: string;
  uploadPhotoTitle: string;
  useCameraTitle: string;
  removeFromClassTitle: string;
  photoUpdatedNotice: (name: string) => string;
  photoUploadFailed: string;
  bulkImportHeading: string;
  bulkImportHelp: string;
  downloadTemplateBtn: string;
  importingBtn: string;
  uploadFilledTemplateBtn: string;
  importAddedNotice: (count: number, issues: string) => string;
  importAddedSimpleNotice: (count: number) => string;
  importFailed: string;
  registerStudentHeading: string;
  firstNameLabel: string;
  lastNameLabel: string;
  admissionYearLabel: string;
  registerBtn: string;
  chooseClassFirstError: string;
  registeredOfflineNotice: string;
  registeredNotice: (admissionId: string) => string;
  couldNotRemoveStudent: string;
  resultsAndSyncHeading: string;
  useIconToEnterResults: string;
  stuckChangesHeading: string;
  stuckStudentsMessage: (count: number) => string;
  stuckResultsMessage: (count: number) => string;
  pendingStudentsMessage: (count: number) => string;
  pendingResultsMessage: (count: number) => string;
  syncingBtn: string;
  syncNowBtn: string;
  syncedSomeNotice: (failed: number) => string;
  allSyncedNotice: string;
  syncFailedError: string;
  everythingSynced: string;
  removeStudentTitle: string;
  removeStudentConfirmPrefix: string;
  removeStudentConfirmSuffix: string;
  noCancel: string;
  removingBtn: string;
  yesRemove: string;
}

const EN: StaffRosterLabels = {
  pageTitle: 'Staff',
  loadClassesTermsFailed: 'Failed to load classes/terms',
  loadStudentsFailed: 'Failed to load students',
  classesAndStudentsHeading: 'Classes & Students',
  allClasses: 'All classes',
  pendingId: 'pending ID',
  enterResultsTitle: 'Enter results',
  uploadPhotoTitle: 'Upload photo',
  useCameraTitle: 'Use camera',
  removeFromClassTitle: 'Remove from class',
  photoUpdatedNotice: (name) => `Photo updated for ${name}.`,
  photoUploadFailed: 'Photo upload failed',
  bulkImportHeading: 'Bulk import students',
  bulkImportHelp: 'For onboarding many existing students at once — class names must match exactly.',
  downloadTemplateBtn: 'Download template',
  importingBtn: 'Importing…',
  uploadFilledTemplateBtn: 'Upload filled template',
  importAddedNotice: (count, issues) => `Added ${count}. ${issues}`,
  importAddedSimpleNotice: (count) => `Added ${count} student(s).`,
  importFailed: 'Import failed — check the file format',
  registerStudentHeading: 'Register a student',
  firstNameLabel: 'First name',
  lastNameLabel: 'Last name',
  admissionYearLabel: 'Admission year',
  registerBtn: 'Register',
  chooseClassFirstError: 'Choose a class first',
  registeredOfflineNotice: 'No internet right now — student saved on this device and will sync automatically.',
  registeredNotice: (admissionId) => `Registered — Admission ID: ${admissionId}`,
  couldNotRemoveStudent: 'Could not remove student',
  resultsAndSyncHeading: 'Results & offline sync',
  useIconToEnterResults: 'Use the icon next to a student above to enter or edit their results for a term.',
  stuckChangesHeading: 'Some offline changes keep failing — this may need a look, not just time.',
  stuckStudentsMessage: (count) => `${count} student registration${count === 1 ? '' : 's'} reached the server and ${count === 1 ? 'was' : 'were'} rejected repeatedly.`,
  stuckResultsMessage: (count) => `${count} result submission${count === 1 ? '' : 's'} reached the server and ${count === 1 ? 'was' : 'were'} rejected repeatedly.`,
  pendingStudentsMessage: (count) => `${count} student${count === 1 ? '' : 's'} saved offline, waiting to sync.`,
  pendingResultsMessage: (count) => `${count} result${count === 1 ? '' : 's'} saved offline, waiting to sync.`,
  syncingBtn: 'Syncing…',
  syncNowBtn: 'Sync now',
  syncedSomeNotice: (failed) => `Synced what we could — ${failed} item(s) still couldn't reach the server and will retry later.`,
  allSyncedNotice: 'All offline changes have been synced.',
  syncFailedError: 'Sync failed — check your connection and try again.',
  everythingSynced: 'Everything is synced — no offline changes pending.',
  removeStudentTitle: 'Remove student?',
  removeStudentConfirmPrefix: 'This will mark ',
  removeStudentConfirmSuffix: ' as withdrawn.',
  noCancel: 'No, cancel',
  removingBtn: 'Removing…',
  yesRemove: 'Yes, remove',
};

const FR: StaffRosterLabels = {
  pageTitle: 'Personnel',
  loadClassesTermsFailed: 'Échec du chargement des classes/trimestres',
  loadStudentsFailed: 'Échec du chargement des élèves',
  classesAndStudentsHeading: 'Classes et élèves',
  allClasses: 'Toutes les classes',
  pendingId: 'matricule en attente',
  enterResultsTitle: 'Saisir les résultats',
  uploadPhotoTitle: 'Téléverser une photo',
  useCameraTitle: 'Utiliser la caméra',
  removeFromClassTitle: 'Retirer de la classe',
  photoUpdatedNotice: (name) => `Photo mise à jour pour ${name}.`,
  photoUploadFailed: 'Échec du téléversement de la photo',
  bulkImportHeading: 'Importation groupée des élèves',
  bulkImportHelp: "Pour intégrer plusieurs élèves existants à la fois — les noms de classe doivent correspondre exactement.",
  downloadTemplateBtn: 'Télécharger le modèle',
  importingBtn: 'Importation…',
  uploadFilledTemplateBtn: 'Téléverser le modèle rempli',
  importAddedNotice: (count, issues) => `${count} ajouté(s). ${issues}`,
  importAddedSimpleNotice: (count) => `${count} élève(s) ajouté(s).`,
  importFailed: 'Échec de l\'importation — vérifiez le format du fichier',
  registerStudentHeading: 'Inscrire un élève',
  firstNameLabel: 'Prénom',
  lastNameLabel: 'Nom',
  admissionYearLabel: "Année d'admission",
  registerBtn: 'Inscrire',
  chooseClassFirstError: "Choisissez d'abord une classe",
  registeredOfflineNotice: 'Pas de connexion internet pour le moment — élève enregistré sur cet appareil, se synchronisera automatiquement.',
  registeredNotice: (admissionId) => `Inscrit — Matricule : ${admissionId}`,
  couldNotRemoveStudent: "Impossible de retirer l'élève",
  resultsAndSyncHeading: 'Résultats et synchronisation hors ligne',
  useIconToEnterResults: "Utilisez l'icône à côté d'un élève ci-dessus pour saisir ou modifier ses résultats pour un trimestre.",
  stuckChangesHeading: 'Certaines modifications hors ligne échouent systématiquement — cela mérite peut-être un examen, pas seulement du temps.',
  stuckStudentsMessage: (count) => `${count} inscription${count === 1 ? '' : 's'} d'élève ${count === 1 ? 'a atteint' : 'ont atteint'} le serveur et ${count === 1 ? 'a été rejetée' : 'ont été rejetées'} à plusieurs reprises.`,
  stuckResultsMessage: (count) => `${count} soumission${count === 1 ? '' : 's'} de résultat ${count === 1 ? 'a atteint' : 'ont atteint'} le serveur et ${count === 1 ? 'a été rejetée' : 'ont été rejetées'} à plusieurs reprises.`,
  pendingStudentsMessage: (count) => `${count} élève${count === 1 ? '' : 's'} enregistré(s) hors ligne, en attente de synchronisation.`,
  pendingResultsMessage: (count) => `${count} résultat${count === 1 ? '' : 's'} enregistré(s) hors ligne, en attente de synchronisation.`,
  syncingBtn: 'Synchronisation…',
  syncNowBtn: 'Synchroniser maintenant',
  syncedSomeNotice: (failed) => `Synchronisé ce qui a pu l'être — ${failed} élément(s) n'ont toujours pas pu atteindre le serveur et seront retentés plus tard.`,
  allSyncedNotice: 'Toutes les modifications hors ligne ont été synchronisées.',
  syncFailedError: 'Échec de la synchronisation — vérifiez votre connexion et réessayez.',
  everythingSynced: 'Tout est synchronisé — aucune modification hors ligne en attente.',
  removeStudentTitle: "Retirer l'élève ?",
  removeStudentConfirmPrefix: 'Ceci marquera ',
  removeStudentConfirmSuffix: ' comme retiré(e).',
  noCancel: 'Non, annuler',
  removingBtn: 'Retrait…',
  yesRemove: 'Oui, retirer',
};

const PT: StaffRosterLabels = {
  pageTitle: 'Pessoal',
  loadClassesTermsFailed: 'Falha ao carregar turmas/períodos',
  loadStudentsFailed: 'Falha ao carregar alunos',
  classesAndStudentsHeading: 'Turmas e Alunos',
  allClasses: 'Todas as turmas',
  pendingId: 'matrícula pendente',
  enterResultsTitle: 'Inserir resultados',
  uploadPhotoTitle: 'Carregar fotografia',
  useCameraTitle: 'Usar câmara',
  removeFromClassTitle: 'Remover da turma',
  photoUpdatedNotice: (name) => `Fotografia atualizada para ${name}.`,
  photoUploadFailed: 'Falha ao carregar a fotografia',
  bulkImportHeading: 'Importação em massa de alunos',
  bulkImportHelp: 'Para integrar muitos alunos existentes de uma só vez — os nomes das turmas devem corresponder exatamente.',
  downloadTemplateBtn: 'Descarregar modelo',
  importingBtn: 'A importar…',
  uploadFilledTemplateBtn: 'Carregar modelo preenchido',
  importAddedNotice: (count, issues) => `${count} adicionado(s). ${issues}`,
  importAddedSimpleNotice: (count) => `${count} aluno(s) adicionado(s).`,
  importFailed: 'Falha na importação — verifique o formato do ficheiro',
  registerStudentHeading: 'Matricular um aluno',
  firstNameLabel: 'Primeiro nome',
  lastNameLabel: 'Apelido',
  admissionYearLabel: 'Ano de matrícula',
  registerBtn: 'Matricular',
  chooseClassFirstError: 'Escolha primeiro uma turma',
  registeredOfflineNotice: 'Sem internet neste momento — aluno guardado neste dispositivo, será sincronizado automaticamente.',
  registeredNotice: (admissionId) => `Matriculado — Número de Matrícula: ${admissionId}`,
  couldNotRemoveStudent: 'Não foi possível remover o aluno',
  resultsAndSyncHeading: 'Resultados e sincronização offline',
  useIconToEnterResults: 'Use o ícone junto a um aluno acima para inserir ou editar os seus resultados de um período.',
  stuckChangesHeading: 'Algumas alterações offline continuam a falhar — isto pode precisar de ser verificado, não apenas de mais tempo.',
  stuckStudentsMessage: (count) => `${count} matrícula(s) de aluno alcançaram o servidor e ${count === 1 ? 'foi rejeitada' : 'foram rejeitadas'} repetidamente.`,
  stuckResultsMessage: (count) => `${count} submissão(ões) de resultado alcançaram o servidor e ${count === 1 ? 'foi rejeitada' : 'foram rejeitadas'} repetidamente.`,
  pendingStudentsMessage: (count) => `${count} aluno(s) guardado(s) offline, à espera de sincronização.`,
  pendingResultsMessage: (count) => `${count} resultado(s) guardado(s) offline, à espera de sincronização.`,
  syncingBtn: 'A sincronizar…',
  syncNowBtn: 'Sincronizar agora',
  syncedSomeNotice: (failed) => `Sincronizado o que foi possível — ${failed} item(ns) ainda não conseguiram alcançar o servidor e serão retentados mais tarde.`,
  allSyncedNotice: 'Todas as alterações offline foram sincronizadas.',
  syncFailedError: 'Falha na sincronização — verifique a sua ligação e tente novamente.',
  everythingSynced: 'Tudo está sincronizado — sem alterações offline pendentes.',
  removeStudentTitle: 'Remover aluno?',
  removeStudentConfirmPrefix: 'Isto irá marcar ',
  removeStudentConfirmSuffix: ' como retirado(a).',
  noCancel: 'Não, cancelar',
  removingBtn: 'A remover…',
  yesRemove: 'Sim, remover',
};

const ES: StaffRosterLabels = {
  pageTitle: 'Personal',
  loadClassesTermsFailed: 'Error al cargar clases/trimestres',
  loadStudentsFailed: 'Error al cargar alumnos',
  classesAndStudentsHeading: 'Clases y alumnos',
  allClasses: 'Todas las clases',
  pendingId: 'matrícula pendiente',
  enterResultsTitle: 'Ingresar resultados',
  uploadPhotoTitle: 'Subir foto',
  useCameraTitle: 'Usar cámara',
  removeFromClassTitle: 'Quitar de la clase',
  photoUpdatedNotice: (name) => `Foto actualizada para ${name}.`,
  photoUploadFailed: 'Error al subir la foto',
  bulkImportHeading: 'Importación masiva de alumnos',
  bulkImportHelp: 'Para incorporar muchos alumnos existentes a la vez; los nombres de clase deben coincidir exactamente.',
  downloadTemplateBtn: 'Descargar plantilla',
  importingBtn: 'Importando…',
  uploadFilledTemplateBtn: 'Subir plantilla completada',
  importAddedNotice: (count, issues) => `Se agregaron ${count}. ${issues}`,
  importAddedSimpleNotice: (count) => `Se agregaron ${count} alumno(s).`,
  importFailed: 'Error en la importación; verifique el formato del archivo',
  registerStudentHeading: 'Matricular un alumno',
  firstNameLabel: 'Nombre',
  lastNameLabel: 'Apellido',
  admissionYearLabel: 'Año de ingreso',
  registerBtn: 'Matricular',
  chooseClassFirstError: 'Elija primero una clase',
  registeredOfflineNotice: 'No hay conexión a internet en este momento; el alumno se guardó en este dispositivo y se sincronizará automáticamente.',
  registeredNotice: (admissionId) => `Matriculado — Número de matrícula: ${admissionId}`,
  couldNotRemoveStudent: 'No se pudo quitar al alumno',
  resultsAndSyncHeading: 'Resultados y sincronización sin conexión',
  useIconToEnterResults: 'Use el ícono junto a un alumno arriba para ingresar o editar sus resultados de un trimestre.',
  stuckChangesHeading: 'Algunos cambios sin conexión siguen fallando; esto puede necesitar revisión, no solo más tiempo.',
  stuckStudentsMessage: (count) => `${count} matrícula(s) de alumno llegaron al servidor y ${count === 1 ? 'fue rechazada' : 'fueron rechazadas'} repetidamente.`,
  stuckResultsMessage: (count) => `${count} envío(s) de resultado llegaron al servidor y ${count === 1 ? 'fue rechazado' : 'fueron rechazados'} repetidamente.`,
  pendingStudentsMessage: (count) => `${count} alumno(s) guardado(s) sin conexión, esperando sincronización.`,
  pendingResultsMessage: (count) => `${count} resultado(s) guardado(s) sin conexión, esperando sincronización.`,
  syncingBtn: 'Sincronizando…',
  syncNowBtn: 'Sincronizar ahora',
  syncedSomeNotice: (failed) => `Se sincronizó lo que se pudo; ${failed} elemento(s) aún no pudieron llegar al servidor y se reintentarán más tarde.`,
  allSyncedNotice: 'Todos los cambios sin conexión se han sincronizado.',
  syncFailedError: 'Error de sincronización; verifique su conexión e inténtelo de nuevo.',
  everythingSynced: 'Todo está sincronizado; no hay cambios sin conexión pendientes.',
  removeStudentTitle: '¿Quitar alumno?',
  removeStudentConfirmPrefix: 'Esto marcará a ',
  removeStudentConfirmSuffix: ' como retirado/a.',
  noCancel: 'No, cancelar',
  removingBtn: 'Quitando…',
  yesRemove: 'Sí, quitar',
};

const STAFF_ROSTER_LABELS_BY_LOCALE: Record<SupportedLocale, StaffRosterLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function staffRosterLabelsFor(locale: string): StaffRosterLabels {
  return STAFF_ROSTER_LABELS_BY_LOCALE[locale as SupportedLocale] ?? STAFF_ROSTER_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
