// web/lib/i18n/classes-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface ClassesLabels {
  pageTitle: string;
  loadFailed: string;
  subjectCatalogHeading: string;
  subjectCatalogHelp: string;
  addSubjectPlaceholder: string;
  addToCatalogBtn: string;
  couldNotAddSubject: string;
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
  createClassHeading: string;
  classNameLabel: string;
  classNamePlaceholder: string;
  classTeacherLabel: string;
  unassigned: string;
  createClassBtn: string;
  couldNotCreateClass: string;
  allClassesHeading: string;
  classTeacherPrefix: string;
  hideSubjectsBtn: string;
  manageSubjectsBtn: string;
  reassignTeacherPlaceholder: string;
  classTeacherUpdatedNotice: string;
  couldNotAssignTeacher: string;
  noSubjectsAssignedYet: string;
  addASubjectPlaceholder: string;
  addBtn: string;
}

const EN: ClassesLabels = {
  pageTitle: 'Classes',
  loadFailed: 'Failed to load classes/staff',
  subjectCatalogHeading: 'Subject catalog',
  subjectCatalogHelp: "School-wide list of subjects — add whatever your curriculum uses, there's no fixed set. Assign the relevant ones to each class below.",
  addSubjectPlaceholder: 'e.g. Further Mathematics, Kiswahili, Twi',
  addToCatalogBtn: 'Add to catalog',
  couldNotAddSubject: 'Could not add subject — it may already exist',
  careerFieldsHeading: 'Career field suggestions',
  careerFieldsHelp: 'Powers Session Wrap\'s "suggested fields" section. The defaults below cover a Nigeria-flavored curriculum — link any subject from your catalog above (like the ones you just added) to the career fields it supports, and Session Wrap will start suggesting them too.',
  subjectSelectLabel: 'Subject',
  careerFieldPlaceholder: 'Career field e.g. Linguistics',
  linkBtn: 'Link',
  mappingLinkedNotice: (subject, field) => `Linked "${subject}" → "${field}" for Session Wrap suggestions.`,
  couldNotAddMapping: 'Could not add career field mapping',
  couldNotRemoveMapping: 'Could not remove mapping',
  yourMappingsHeading: "Your school's mappings",
  platformDefaults: (count) => `Platform defaults (${count})`,
  createClassHeading: 'Create a class',
  classNameLabel: 'Class name',
  classNamePlaceholder: 'JSS 2',
  classTeacherLabel: 'Class teacher (optional — can assign later)',
  unassigned: '— unassigned —',
  createClassBtn: 'Create class',
  couldNotCreateClass: 'Could not create class',
  allClassesHeading: 'All classes',
  classTeacherPrefix: 'class teacher:',
  hideSubjectsBtn: 'Hide subjects',
  manageSubjectsBtn: 'Manage subjects',
  reassignTeacherPlaceholder: 'Reassign teacher…',
  classTeacherUpdatedNotice: 'Class teacher updated.',
  couldNotAssignTeacher: 'Could not assign teacher',
  noSubjectsAssignedYet: 'No subjects assigned yet.',
  addASubjectPlaceholder: 'Add a subject…',
  addBtn: 'Add',
};

const FR: ClassesLabels = {
  pageTitle: 'Classes',
  loadFailed: 'Échec du chargement des classes/personnel',
  subjectCatalogHeading: 'Catalogue des matières',
  subjectCatalogHelp: "Liste des matières à l'échelle de l'école — ajoutez tout ce que votre programme utilise, il n'y a pas d'ensemble figé. Assignez les matières pertinentes à chaque classe ci-dessous.",
  addSubjectPlaceholder: 'ex. Mathématiques avancées, Kiswahili, Twi',
  addToCatalogBtn: 'Ajouter au catalogue',
  couldNotAddSubject: 'Impossible d\'ajouter la matière — elle existe peut-être déjà',
  careerFieldsHeading: 'Suggestions de filières',
  careerFieldsHelp: 'Alimente la section « filières suggérées » du Bilan de l\'année. Les valeurs par défaut ci-dessous couvrent un programme de type nigérian — associez toute matière de votre catalogue ci-dessus (comme celles que vous venez d\'ajouter) aux filières qu\'elle soutient, et le Bilan de l\'année commencera aussi à les suggérer.',
  subjectSelectLabel: 'Matière',
  careerFieldPlaceholder: 'Filière, ex. Linguistique',
  linkBtn: 'Associer',
  mappingLinkedNotice: (subject, field) => `« ${subject} » associé à « ${field} » pour les suggestions du Bilan de l'année.`,
  couldNotAddMapping: "Impossible d'ajouter cette association",
  couldNotRemoveMapping: 'Impossible de retirer cette association',
  yourMappingsHeading: 'Les associations de votre école',
  platformDefaults: (count) => `Valeurs par défaut de la plateforme (${count})`,
  createClassHeading: 'Créer une classe',
  classNameLabel: 'Nom de la classe',
  classNamePlaceholder: '3ème',
  classTeacherLabel: "Professeur principal (facultatif — peut être assigné plus tard)",
  unassigned: '— non assigné —',
  createClassBtn: 'Créer la classe',
  couldNotCreateClass: 'Impossible de créer la classe',
  allClassesHeading: 'Toutes les classes',
  classTeacherPrefix: 'professeur principal :',
  hideSubjectsBtn: 'Masquer les matières',
  manageSubjectsBtn: 'Gérer les matières',
  reassignTeacherPlaceholder: 'Réaffecter à un enseignant…',
  classTeacherUpdatedNotice: 'Professeur principal mis à jour.',
  couldNotAssignTeacher: "Impossible d'assigner l'enseignant",
  noSubjectsAssignedYet: 'Aucune matière assignée pour le moment.',
  addASubjectPlaceholder: 'Ajouter une matière…',
  addBtn: 'Ajouter',
};

const PT: ClassesLabels = {
  pageTitle: 'Turmas',
  loadFailed: 'Falha ao carregar turmas/pessoal',
  subjectCatalogHeading: 'Catálogo de disciplinas',
  subjectCatalogHelp: 'Lista de disciplinas de toda a escola — adicione o que o seu currículo utilizar, não há um conjunto fixo. Atribua as relevantes a cada turma abaixo.',
  addSubjectPlaceholder: 'ex. Matemática Avançada, Suaíli, Twi',
  addToCatalogBtn: 'Adicionar ao catálogo',
  couldNotAddSubject: 'Não foi possível adicionar a disciplina — pode já existir',
  careerFieldsHeading: 'Sugestões de áreas profissionais',
  careerFieldsHelp: 'Alimenta a secção de "áreas sugeridas" do Resumo do Ano Letivo. As predefinições abaixo cobrem um currículo comum na região — associe qualquer disciplina do seu catálogo acima (como as que acabou de adicionar) às áreas profissionais que apoia, e o Resumo do Ano Letivo passará também a sugeri-las.',
  subjectSelectLabel: 'Disciplina',
  careerFieldPlaceholder: 'Área profissional, ex. Linguística',
  linkBtn: 'Associar',
  mappingLinkedNotice: (subject, field) => `Associada "${subject}" → "${field}" para as sugestões do Resumo do Ano Letivo.`,
  couldNotAddMapping: 'Não foi possível adicionar esta associação',
  couldNotRemoveMapping: 'Não foi possível remover esta associação',
  yourMappingsHeading: 'As associações da sua escola',
  platformDefaults: (count) => `Predefinições da plataforma (${count})`,
  createClassHeading: 'Criar uma turma',
  classNameLabel: 'Nome da turma',
  classNamePlaceholder: '8ª Classe',
  classTeacherLabel: 'Diretor(a) de turma (opcional — pode atribuir depois)',
  unassigned: '— não atribuído —',
  createClassBtn: 'Criar turma',
  couldNotCreateClass: 'Não foi possível criar a turma',
  allClassesHeading: 'Todas as turmas',
  classTeacherPrefix: 'diretor(a) de turma:',
  hideSubjectsBtn: 'Ocultar disciplinas',
  manageSubjectsBtn: 'Gerir disciplinas',
  reassignTeacherPlaceholder: 'Reatribuir professor…',
  classTeacherUpdatedNotice: 'Diretor(a) de turma atualizado(a).',
  couldNotAssignTeacher: 'Não foi possível atribuir o professor',
  noSubjectsAssignedYet: 'Ainda não há disciplinas atribuídas.',
  addASubjectPlaceholder: 'Adicionar uma disciplina…',
  addBtn: 'Adicionar',
};

const CLASSES_LABELS_BY_LOCALE: Record<SupportedLocale, ClassesLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
};

export function classesLabelsFor(locale: string): ClassesLabels {
  return CLASSES_LABELS_BY_LOCALE[locale as SupportedLocale] ?? CLASSES_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
