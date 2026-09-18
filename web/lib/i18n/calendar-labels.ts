// web/lib/i18n/calendar-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';
import type { CalendarEventType } from '../types';

export interface CalendarLabels {
  pageTitle: string;
  termLabel: string;
  selectTerm: string;
  generateDraftHeading: string;
  generateDraftHelp: string;
  resumptionDateLabel: string;
  weeksInTermLabel: string;
  midtermBreakLabel: string;
  examWeeksLabel: string;
  generateDraftBtn: string;
  draftGeneratedNotice: string;
  couldNotGenerateDraft: string;
  titlePlaceholder: string;
  applyBtn: string;
  cancelBtn: string;
  toDate: (date: string) => string;
  editBtn: string;
  deleteBtn: string;
  saveBtn: string;
  editEventHeading: string;
  addEventManuallyHeading: string;
  saveChangesBtn: string;
  addBtn: string;
  couldNotSaveChanges: string;
  couldNotAddEvent: string;
  thisTermsEventsHeading: string;
  eventTypeLabels: Record<CalendarEventType, string>;
}

const EVENT_TYPE_EN: Record<CalendarEventType, string> = {
  TERM_START: 'TERM START',
  TERM_END: 'TERM END',
  MIDTERM_BREAK: 'MIDTERM BREAK',
  EXAM_PERIOD: 'EXAM PERIOD',
  RESUMPTION: 'RESUMPTION',
  PTA_MEETING: 'PTA MEETING',
  HOLIDAY: 'HOLIDAY',
  CUSTOM: 'CUSTOM',
};

const EVENT_TYPE_FR: Record<CalendarEventType, string> = {
  TERM_START: 'DÉBUT DE TRIMESTRE',
  TERM_END: 'FIN DE TRIMESTRE',
  MIDTERM_BREAK: 'VACANCES DE MI-TRIMESTRE',
  EXAM_PERIOD: "PÉRIODE D'EXAMENS",
  RESUMPTION: 'REPRISE',
  PTA_MEETING: 'RÉUNION PARENTS-PROFESSEURS',
  HOLIDAY: 'JOUR FÉRIÉ',
  CUSTOM: 'PERSONNALISÉ',
};

const EN: CalendarLabels = {
  pageTitle: 'Academic Calendar',
  termLabel: 'Term',
  selectTerm: 'Select a term',
  generateDraftHeading: 'Generate a draft term schedule',
  generateDraftHelp: 'Nothing is saved yet — review the draft below, edit or remove entries as needed, then save only the events you want to keep.',
  resumptionDateLabel: 'Resumption date',
  weeksInTermLabel: 'Weeks in term',
  midtermBreakLabel: 'Midterm break (week #)',
  examWeeksLabel: 'Exam weeks (at end)',
  generateDraftBtn: 'Generate draft',
  draftGeneratedNotice: 'Draft generated below — review it, then save the ones you want to keep.',
  couldNotGenerateDraft: 'Could not generate a draft — check the start date and week counts',
  titlePlaceholder: 'Title',
  applyBtn: 'Apply',
  cancelBtn: 'Cancel',
  toDate: (date) => ` to ${date}`,
  editBtn: 'Edit',
  deleteBtn: 'Delete',
  saveBtn: 'Save',
  editEventHeading: 'Edit event',
  addEventManuallyHeading: 'Add an event manually',
  saveChangesBtn: 'Save changes',
  addBtn: 'Add',
  couldNotSaveChanges: 'Could not save changes',
  couldNotAddEvent: 'Could not add event',
  thisTermsEventsHeading: "This term's events",
  eventTypeLabels: EVENT_TYPE_EN,
};

const FR: CalendarLabels = {
  pageTitle: 'Calendrier académique',
  termLabel: 'Trimestre',
  selectTerm: 'Sélectionner un trimestre',
  generateDraftHeading: 'Générer un brouillon de calendrier',
  generateDraftHelp: "Rien n'est encore enregistré — passez en revue le brouillon ci-dessous, modifiez ou supprimez des entrées si besoin, puis n'enregistrez que les événements que vous souhaitez garder.",
  resumptionDateLabel: 'Date de reprise',
  weeksInTermLabel: 'Semaines dans le trimestre',
  midtermBreakLabel: 'Vacances de mi-trimestre (semaine n°)',
  examWeeksLabel: "Semaines d'examens (à la fin)",
  generateDraftBtn: 'Générer le brouillon',
  draftGeneratedNotice: "Brouillon généré ci-dessous — passez-le en revue, puis enregistrez ceux que vous souhaitez garder.",
  couldNotGenerateDraft: 'Impossible de générer un brouillon — vérifiez la date de début et le nombre de semaines',
  titlePlaceholder: 'Titre',
  applyBtn: 'Appliquer',
  cancelBtn: 'Annuler',
  toDate: (date) => ` au ${date}`,
  editBtn: 'Modifier',
  deleteBtn: 'Supprimer',
  saveBtn: 'Enregistrer',
  editEventHeading: "Modifier l'événement",
  addEventManuallyHeading: 'Ajouter un événement manuellement',
  saveChangesBtn: 'Enregistrer les modifications',
  addBtn: 'Ajouter',
  couldNotSaveChanges: 'Impossible d\'enregistrer les modifications',
  couldNotAddEvent: "Impossible d'ajouter l'événement",
  thisTermsEventsHeading: 'Événements de ce trimestre',
  eventTypeLabels: EVENT_TYPE_FR,
};

const CALENDAR_LABELS_BY_LOCALE: Record<SupportedLocale, CalendarLabels> = {
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

export function calendarLabelsFor(locale: string): CalendarLabels {
  return CALENDAR_LABELS_BY_LOCALE[locale as SupportedLocale] ?? CALENDAR_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
