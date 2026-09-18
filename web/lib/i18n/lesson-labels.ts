// web/lib/i18n/lesson-labels.ts
/**
 * Every fixed UI string across the Lesson Notes feature — the public
 * student reader (app/[school]/lessons/*) and the staff editor/presenter
 * (app/[school]/staff/lessons/*). Does NOT translate what a teacher
 * actually types (topic, objectives, presentation content, materials
 * filenames) — only the platform's own labels around it.
 */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface LessonLabels {
  // Public: lessons/page.tsx (Admission ID gate + note list)
  lessonNotes: string;
  enterAdmissionId: string;
  admissionIdPlaceholder: string;
  continueBtn: string;
  couldNotVerifyAdmissionId: string;
  browseNotes: string;
  allSubjects: string;
  noNotesShared: string;
  // Public: lessons/[id]/page.tsx (single note reader)
  noteUnavailable: string;
  objectives: string;
  previousKnowledge: string;
  presentation: string;
  evaluation: string;
  assignment: string;
  summary: string;
  // Staff: staff/lessons/page.tsx (editor + list)
  pageTitle: string;
  editNote: string;
  newNote: string;
  classLabel: string;
  termLabel: string;
  subjectPlaceholder: string;
  topicPlaceholder: string;
  durationPlaceholder: string;
  objectivesFieldLabel: string;
  instructionalMaterialsLabel: string;
  previousKnowledgeFieldLabel: string;
  presentationFieldLabel: string;
  presentationPlaceholderExample: string;
  evaluationFieldLabel: string;
  assignmentFieldLabel: string;
  summaryFieldLabel: string;
  saveChanges: string;
  saveAsDraft: string;
  cancel: string;
  savedNotice: string;
  draftCreatedNotice: string;
  couldNotSaveNote: string;
  failedToLoad: string;
  materialsHeading: string;
  materialsHelp: string;
  anchorStart: string;
  anchorAfterObjectives: string;
  anchorAfterPreviousKnowledge: string;
  anchorAfterEvaluation: string;
  anchorAfterAssignment: string;
  anchorAfterSummary: string;
  anchorEnd: string;
  uploading: string;
  uploadFile: string;
  material: string;
  remove: string;
  noMaterialsYet: string;
  couldNotUploadMaterial: string;
  allNotesHeading: string;
  edit: string;
  present: string;
  copyStudentLink: string;
  studentLinkCopiedNotice: string;
  unpublish: string;
  publish: string;
  deleteBtn: string;
  // Staff: present/page.tsx (presenter mode slides + controls)
  materialFallbackHeading: string;
  presentationSlideHeading: (i: number, total: number) => string;
  annotateSlide: string;
  blankWhiteboard: string;
  fullscreen: string;
  back: string;
  next: string;
  projectToStudents: string;
  projectingUnavailableTitle: string;
  projectingUnavailableBody: string;
  startProjecting: string;
  stopProjecting: string;
  starting: string;
  scanToJoin: string;
  studentsConnected: (count: number) => string;
  couldNotStartProjecting: string;
}

const EN: LessonLabels = {
  lessonNotes: 'Lesson notes',
  enterAdmissionId: 'Enter your Admission ID to see notes shared with your class.',
  admissionIdPlaceholder: 'Admission ID',
  continueBtn: 'Continue',
  couldNotVerifyAdmissionId: 'Could not verify that Admission ID',
  browseNotes: 'Browse notes your teachers have shared — read anytime, at your own pace.',
  allSubjects: 'All subjects',
  noNotesShared: 'No lesson notes have been shared yet.',
  noteUnavailable: "This lesson note isn't available.",
  objectives: 'Objectives',
  previousKnowledge: 'Previous Knowledge',
  presentation: 'Presentation',
  evaluation: 'Evaluation',
  assignment: 'Assignment',
  summary: 'Summary',
  pageTitle: 'Lesson Notes',
  editNote: 'Edit lesson note',
  newNote: 'New lesson note',
  classLabel: 'Class',
  termLabel: 'Term',
  subjectPlaceholder: 'Subject',
  topicPlaceholder: 'Topic',
  durationPlaceholder: 'Duration (minutes)',
  objectivesFieldLabel: 'Instructional objectives (one per line — "By the end of this lesson, students should be able to...")',
  instructionalMaterialsLabel: 'Instructional materials',
  previousKnowledgeFieldLabel: 'Previous knowledge (what students already know coming into this)',
  presentationFieldLabel: 'Presentation / content — separate each projector slide with a line containing only ---',
  presentationPlaceholderExample: 'Step 1: introduce the topic...\n---\nStep 2: work through an example...\n---\nStep 3: class practice...',
  evaluationFieldLabel: 'Evaluation (questions to check understanding)',
  assignmentFieldLabel: 'Assignment',
  summaryFieldLabel: 'Summary',
  saveChanges: 'Save changes',
  saveAsDraft: 'Save as draft',
  cancel: 'Cancel',
  savedNotice: 'Saved.',
  draftCreatedNotice: 'Draft created.',
  couldNotSaveNote: 'Could not save this lesson note',
  failedToLoad: 'Failed to load lesson notes',
  materialsHeading: 'Materials',
  materialsHelp: 'Upload diagrams, scanned pages, PDFs, or PowerPoint slides. Each becomes its own slide in Presenter Mode — pick where it should appear.',
  anchorStart: 'At the start',
  anchorAfterObjectives: 'After Objectives',
  anchorAfterPreviousKnowledge: 'After Previous Knowledge',
  anchorAfterEvaluation: 'After Evaluation',
  anchorAfterAssignment: 'After Assignment',
  anchorAfterSummary: 'After Summary',
  anchorEnd: 'At the end',
  uploading: 'Uploading…',
  uploadFile: 'Upload file',
  material: 'Material',
  remove: 'Remove',
  noMaterialsYet: 'No materials uploaded yet.',
  couldNotUploadMaterial: 'Could not upload material',
  allNotesHeading: 'All lesson notes',
  edit: 'Edit',
  present: 'Present',
  copyStudentLink: 'Copy student link',
  studentLinkCopiedNotice: 'Student link copied — share it in your class group.',
  unpublish: 'Unpublish',
  publish: 'Publish',
  deleteBtn: 'Delete',
  materialFallbackHeading: 'Material',
  presentationSlideHeading: (i, total) => (total > 1 ? `Presentation (${i}/${total})` : 'Presentation'),
  annotateSlide: 'Annotate this slide',
  blankWhiteboard: 'Blank whiteboard',
  fullscreen: 'Fullscreen',
  back: 'Back',
  next: 'Next',
  projectToStudents: 'Project to students',
  projectingUnavailableTitle: 'Not available on this device',
  projectingUnavailableBody: "Projecting to students' own phones over WiFi with no internet needs the Elorge Teacher App — this browser can't run a local server. Use a projector, or the fullscreen/whiteboard tools above, for now.",
  startProjecting: 'Start projecting',
  stopProjecting: 'Stop projecting',
  starting: 'Starting…',
  scanToJoin: 'Students: connect to your WiFi, then scan this to follow along',
  studentsConnected: (count) => `${count} student${count === 1 ? '' : 's'} connected`,
  couldNotStartProjecting: 'Could not start projecting',
};

const FR: LessonLabels = {
  lessonNotes: 'Notes de cours',
  enterAdmissionId: 'Saisissez votre matricule pour voir les notes partagées avec votre classe.',
  admissionIdPlaceholder: 'Matricule',
  continueBtn: 'Continuer',
  couldNotVerifyAdmissionId: 'Impossible de vérifier ce matricule',
  browseNotes: 'Parcourez les notes partagées par vos enseignants — à lire à tout moment, à votre rythme.',
  allSubjects: 'Toutes les matières',
  noNotesShared: 'Aucune note de cours partagée pour le moment.',
  noteUnavailable: "Cette note de cours n'est pas disponible.",
  objectives: 'Objectifs',
  previousKnowledge: 'Prérequis',
  presentation: 'Présentation',
  evaluation: 'Évaluation',
  assignment: 'Devoir',
  summary: 'Résumé',
  pageTitle: 'Notes de cours',
  editNote: 'Modifier la note de cours',
  newNote: 'Nouvelle note de cours',
  classLabel: 'Classe',
  termLabel: 'Trimestre',
  subjectPlaceholder: 'Matière',
  topicPlaceholder: 'Sujet',
  durationPlaceholder: 'Durée (minutes)',
  objectivesFieldLabel: "Objectifs pédagogiques (un par ligne — « À la fin de ce cours, les élèves devront pouvoir... »)",
  instructionalMaterialsLabel: 'Matériel pédagogique',
  previousKnowledgeFieldLabel: 'Prérequis (ce que les élèves savent déjà avant ce cours)',
  presentationFieldLabel: 'Présentation / contenu — séparez chaque diapositive du projecteur par une ligne contenant uniquement ---',
  presentationPlaceholderExample: "Étape 1 : introduire le sujet...\n---\nÉtape 2 : travailler un exemple...\n---\nÉtape 3 : exercice en classe...",
  evaluationFieldLabel: 'Évaluation (questions pour vérifier la compréhension)',
  assignmentFieldLabel: 'Devoir',
  summaryFieldLabel: 'Résumé',
  saveChanges: 'Enregistrer les modifications',
  saveAsDraft: 'Enregistrer comme brouillon',
  cancel: 'Annuler',
  savedNotice: 'Enregistré.',
  draftCreatedNotice: 'Brouillon créé.',
  couldNotSaveNote: "Impossible d'enregistrer cette note de cours",
  failedToLoad: 'Échec du chargement des notes de cours',
  materialsHeading: 'Matériel',
  materialsHelp: 'Téléversez des schémas, pages scannées, PDF ou diapositives PowerPoint. Chacun devient sa propre diapositive en Mode Présentateur — choisissez où il doit apparaître.',
  anchorStart: 'Au début',
  anchorAfterObjectives: 'Après les Objectifs',
  anchorAfterPreviousKnowledge: 'Après les Prérequis',
  anchorAfterEvaluation: "Après l'Évaluation",
  anchorAfterAssignment: 'Après le Devoir',
  anchorAfterSummary: 'Après le Résumé',
  anchorEnd: 'À la fin',
  uploading: 'Téléversement…',
  uploadFile: 'Téléverser un fichier',
  material: 'Matériel',
  remove: 'Retirer',
  noMaterialsYet: 'Aucun matériel téléversé pour le moment.',
  couldNotUploadMaterial: 'Impossible de téléverser ce matériel',
  allNotesHeading: 'Toutes les notes de cours',
  edit: 'Modifier',
  present: 'Présenter',
  copyStudentLink: "Copier le lien pour les élèves",
  studentLinkCopiedNotice: 'Lien élève copié — partagez-le dans le groupe de votre classe.',
  unpublish: 'Dépublier',
  publish: 'Publier',
  deleteBtn: 'Supprimer',
  materialFallbackHeading: 'Matériel',
  presentationSlideHeading: (i, total) => (total > 1 ? `Présentation (${i}/${total})` : 'Présentation'),
  annotateSlide: 'Annoter cette diapositive',
  blankWhiteboard: 'Tableau blanc vierge',
  fullscreen: 'Plein écran',
  back: 'Retour',
  next: 'Suivant',
  projectToStudents: 'Projeter aux élèves',
  projectingUnavailableTitle: 'Non disponible sur cet appareil',
  projectingUnavailableBody: "Projeter sur les téléphones des élèves via WiFi sans internet nécessite l'application Elorge Enseignant — ce navigateur ne peut pas exécuter de serveur local. Utilisez un projecteur, ou les outils plein écran/tableau blanc ci-dessus, pour le moment.",
  startProjecting: 'Démarrer la projection',
  stopProjecting: 'Arrêter la projection',
  starting: 'Démarrage…',
  scanToJoin: 'Élèves : connectez-vous à votre WiFi, puis scannez ceci pour suivre',
  studentsConnected: (count) => `${count} élève(s) connecté(s)`,
  couldNotStartProjecting: 'Impossible de démarrer la projection',
};

const PT: LessonLabels = {
  lessonNotes: 'Notas de aula',
  enterAdmissionId: 'Insira o seu Número de Matrícula para ver as notas partilhadas com a sua turma.',
  admissionIdPlaceholder: 'Número de Matrícula',
  continueBtn: 'Continuar',
  couldNotVerifyAdmissionId: 'Não foi possível verificar esse Número de Matrícula',
  browseNotes: 'Explore as notas partilhadas pelos seus professores — leia a qualquer momento, ao seu próprio ritmo.',
  allSubjects: 'Todas as disciplinas',
  noNotesShared: 'Ainda não foram partilhadas notas de aula.',
  noteUnavailable: 'Esta nota de aula não está disponível.',
  objectives: 'Objetivos',
  previousKnowledge: 'Conhecimentos Prévios',
  presentation: 'Apresentação',
  evaluation: 'Avaliação',
  assignment: 'Trabalho de Casa',
  summary: 'Resumo',
  pageTitle: 'Notas de Aula',
  editNote: 'Editar nota de aula',
  newNote: 'Nova nota de aula',
  classLabel: 'Turma',
  termLabel: 'Período',
  subjectPlaceholder: 'Disciplina',
  topicPlaceholder: 'Tópico',
  durationPlaceholder: 'Duração (minutos)',
  objectivesFieldLabel: 'Objetivos instrucionais (um por linha — "No final desta aula, os alunos deverão ser capazes de...")',
  instructionalMaterialsLabel: 'Materiais instrucionais',
  previousKnowledgeFieldLabel: 'Conhecimentos prévios (o que os alunos já sabem antes desta aula)',
  presentationFieldLabel: 'Apresentação / conteúdo — separe cada diapositivo do projetor com uma linha contendo apenas ---',
  presentationPlaceholderExample: 'Passo 1: apresentar o tópico...\n---\nPasso 2: trabalhar um exemplo...\n---\nPasso 3: prática em turma...',
  evaluationFieldLabel: 'Avaliação (perguntas para verificar a compreensão)',
  assignmentFieldLabel: 'Trabalho de Casa',
  summaryFieldLabel: 'Resumo',
  saveChanges: 'Guardar alterações',
  saveAsDraft: 'Guardar como rascunho',
  cancel: 'Cancelar',
  savedNotice: 'Guardado.',
  draftCreatedNotice: 'Rascunho criado.',
  couldNotSaveNote: 'Não foi possível guardar esta nota de aula',
  failedToLoad: 'Falha ao carregar as notas de aula',
  materialsHeading: 'Materiais',
  materialsHelp: 'Carregue diagramas, páginas digitalizadas, PDFs, ou diapositivos PowerPoint. Cada um torna-se o seu próprio diapositivo no Modo Apresentador — escolha onde deve aparecer.',
  anchorStart: 'No início',
  anchorAfterObjectives: 'Após os Objetivos',
  anchorAfterPreviousKnowledge: 'Após os Conhecimentos Prévios',
  anchorAfterEvaluation: 'Após a Avaliação',
  anchorAfterAssignment: 'Após o Trabalho de Casa',
  anchorAfterSummary: 'Após o Resumo',
  anchorEnd: 'No final',
  uploading: 'A carregar…',
  uploadFile: 'Carregar ficheiro',
  material: 'Material',
  remove: 'Remover',
  noMaterialsYet: 'Ainda não há materiais carregados.',
  couldNotUploadMaterial: 'Não foi possível carregar este material',
  allNotesHeading: 'Todas as notas de aula',
  edit: 'Editar',
  present: 'Apresentar',
  copyStudentLink: 'Copiar link para alunos',
  studentLinkCopiedNotice: 'Link para alunos copiado — partilhe-o no grupo da sua turma.',
  unpublish: 'Despublicar',
  publish: 'Publicar',
  deleteBtn: 'Eliminar',
  materialFallbackHeading: 'Material',
  presentationSlideHeading: (i, total) => (total > 1 ? `Apresentação (${i}/${total})` : 'Apresentação'),
  annotateSlide: 'Anotar este diapositivo',
  blankWhiteboard: 'Quadro branco em branco',
  fullscreen: 'Ecrã inteiro',
  back: 'Voltar',
  next: 'Seguinte',
  projectToStudents: 'Projetar para os alunos',
  projectingUnavailableTitle: 'Não disponível neste dispositivo',
  projectingUnavailableBody: 'Projetar para os telemóveis dos próprios alunos via WiFi sem internet requer a Aplicação Elorge para Professores — este navegador não consegue executar um servidor local. Utilize um projetor, ou as ferramentas de ecrã inteiro/quadro branco acima, por agora.',
  startProjecting: 'Iniciar projeção',
  stopProjecting: 'Parar projeção',
  starting: 'A iniciar…',
  scanToJoin: 'Alunos: liguem-se ao vosso WiFi, e depois digitalizem isto para acompanhar',
  studentsConnected: (count) => `${count} aluno(s) ligado(s)`,
  couldNotStartProjecting: 'Não foi possível iniciar a projeção',
};

const LESSON_LABELS_BY_LOCALE: Record<SupportedLocale, LessonLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
};

export function lessonLabelsFor(locale: string): LessonLabels {
  return LESSON_LABELS_BY_LOCALE[locale as SupportedLocale] ?? LESSON_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
