// web/lib/i18n/subjects-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface SubjectsLabels {
  pageTitle: string;
  loadFailed: string;
  subjectCatalogHeading: string;
  subjectCatalogHelp: string;
  removeSubjectTitle: string;
  noSubjectsYet: string;
  addSubjectPlaceholder: string;
  addSubjectBtn: string;
  subjectAddedNotice: (name: string) => string;
  couldNotAddSubject: string;
  subjectRemovedNotice: (name: string) => string;
  couldNotRemoveSubject: string;
  careerFieldsHeading: string;
  careerFieldsHelp: string;
  subjectSelectLabel: string;
  careerFieldPlaceholder: string;
  linkBtn: string;
  mappingLinkedNotice: (subject: string, field: string) => string;
  couldNotAddMapping: string;
  couldNotRemoveMapping: string;
  yourMappingsHeading: string;
  platformDefaults: (count: number) => string;
}

const EN: SubjectsLabels = {
  pageTitle: 'Subjects',
  loadFailed: 'Failed to load subjects and career fields',
  subjectCatalogHeading: 'Subject catalog',
  subjectCatalogHelp: "Your school's own list — not shared with any other school. Add whatever your curriculum uses; there's no fixed set.",
  removeSubjectTitle: 'Remove subject',
  noSubjectsYet: 'No subjects added yet.',
  addSubjectPlaceholder: 'e.g. Kiswahili, Twi, Further Maths',
  addSubjectBtn: 'Add subject',
  subjectAddedNotice: (name) => `"${name}" added to your subject catalog.`,
  couldNotAddSubject: 'Could not add subject — it may already exist.',
  subjectRemovedNotice: (name) => `Removed "${name}" and its class assignments.`,
  couldNotRemoveSubject: 'Could not remove subject',
  careerFieldsHeading: 'Career field suggestions',
  careerFieldsHelp: 'Powers the "suggested fields" section of Session Wrap. The defaults below cover a Nigeria-flavored curriculum — link any subject your school teaches (like the ones you just added above) to the career fields it supports, and Session Wrap will start suggesting them too.',
  subjectSelectLabel: 'Subject',
  careerFieldPlaceholder: 'Career field e.g. Linguistics',
  linkBtn: 'Link',
  mappingLinkedNotice: (subject, field) => `Linked "${subject}" → "${field}" for Session Wrap suggestions.`,
  couldNotAddMapping: 'Could not add career field mapping',
  couldNotRemoveMapping: 'Could not remove mapping',
  yourMappingsHeading: "Your school's mappings",
  platformDefaults: (count) => `Platform defaults (${count})`,
};

const FR: SubjectsLabels = {
  pageTitle: 'Matières',
  loadFailed: 'Échec du chargement des matières et filières',
  subjectCatalogHeading: 'Catalogue des matières',
  subjectCatalogHelp: "La liste propre à votre école — non partagée avec les autres écoles. Ajoutez tout ce que votre programme utilise ; il n'y a pas d'ensemble figé.",
  removeSubjectTitle: 'Retirer la matière',
  noSubjectsYet: 'Aucune matière ajoutée pour le moment.',
  addSubjectPlaceholder: 'ex. Kiswahili, Twi, Mathématiques avancées',
  addSubjectBtn: 'Ajouter une matière',
  subjectAddedNotice: (name) => `« ${name} » ajouté à votre catalogue de matières.`,
  couldNotAddSubject: 'Impossible d\'ajouter la matière — elle existe peut-être déjà.',
  subjectRemovedNotice: (name) => `« ${name} » retiré, ainsi que ses affectations de classe.`,
  couldNotRemoveSubject: 'Impossible de retirer la matière',
  careerFieldsHeading: 'Suggestions de filières',
  careerFieldsHelp: 'Alimente la section « filières suggérées » du Bilan de l\'année. Les valeurs par défaut ci-dessous couvrent un programme de type nigérian — associez toute matière enseignée par votre école (comme celles que vous venez d\'ajouter) aux filières qu\'elle soutient, et le Bilan de l\'année commencera aussi à les suggérer.',
  subjectSelectLabel: 'Matière',
  careerFieldPlaceholder: 'Filière, ex. Linguistique',
  linkBtn: 'Associer',
  mappingLinkedNotice: (subject, field) => `« ${subject} » associé à « ${field} » pour les suggestions du Bilan de l'année.`,
  couldNotAddMapping: "Impossible d'ajouter cette association",
  couldNotRemoveMapping: 'Impossible de retirer cette association',
  yourMappingsHeading: 'Les associations de votre école',
  platformDefaults: (count) => `Valeurs par défaut de la plateforme (${count})`,
};

const SUBJECTS_LABELS_BY_LOCALE: Record<SupportedLocale, SubjectsLabels> = {
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

export function subjectsLabelsFor(locale: string): SubjectsLabels {
  return SUBJECTS_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SUBJECTS_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
