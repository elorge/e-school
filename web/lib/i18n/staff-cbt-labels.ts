// web/lib/i18n/staff-cbt-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface StaffCbtLabels {
  pageTitle: string;
  startTestSessionBtn: string;
  loadSetupDataFailed: string;
  createTestHeading: string;
  basicsLabel: string;
  titleLabel: string;
  titlePlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  classLabel: string;
  selectClass: string;
  termLabel: string;
  selectTerm: string;
  timingLabel: string;
  durationLabel: string;
  testDateLabel: string;
  scoringLabel: string;
  theoryMaxScoreLabel: string;
  objectivesOnlyHint: string;
  reportCardComponentLabel: string;
  reportCardComponentPlaceholder: string;
  countsTowardReport: string;
  practiceHint: string;
  createTestBtn: string;
  couldNotCreateTest: string;
  couldNotResumeTest: string;
  addQuestionsHeading: (title: string) => string;
  downloadQuestionTemplateBtn: string;
  orText: string;
  uploadingBtn: string;
  uploadFilledTemplateBtn: string;
  questionsOnTestSoFar: (count: number) => string;
  orAddOneAtATime: string;
  multipleChoiceBtn: string;
  codeChallengeBtn: string;
  codeChallengeDisabledTitle: string;
  codeChallengeComingSoon: string;
  codeChallengeComingSoonNotice: string;
  questionTextPlaceholder: string;
  optionPlaceholder: (n: number) => string;
  correctLabel: string;
  toolbarHelp: string;
  addPointLabel: string;
  addQuestionBtn: string;
  selectCorrectOptionError: string;
  couldNotAddQuestion: string;
  couldNotAddCodeQuestion: string;
  addedCodeQuestionNotice: (preview: string, count: number) => string;
  uploadFailedError: string;
  uploadAddedWithIssues: (added: number, total: number, issues: string) => string;
  uploadAddedSimple: (added: number, total: number) => string;
  questionCardTitle: (n: number) => string;
  point: string;
  points: string;
  livePreviewLabel: string;
  questionTextPlaceholderPreview: string;
  optionFallback: (n: number) => string;
  assignToLabel: (selected: number, total: number) => string;
  publishBtn: (count: number) => string;
  couldNotPublish: string;
  publishedNotice: (date: string, code: string, url: string) => string;
  allTestsHeading: (count: number) => string;
  filterAll: string;
  minutesAbbrev: string;
  ptsAbbrev: string;
  theoryAbbrev: (n: number) => string;
  clickToContinue: string;
  printPaperBtn: string;
  questionsBtn: string;
  viewScoresBtn: string;
  previousBtn: string;
  nextBtn: string;
  pageOf: (page: number, total: number) => string;
}

const EN: StaffCbtLabels = {
  pageTitle: 'Computer-Based Tests',
  startTestSessionBtn: 'Start a test session',
  loadSetupDataFailed: 'Failed to load setup data',
  createTestHeading: 'Create a test',
  basicsLabel: 'Basics',
  titleLabel: 'Title',
  titlePlaceholder: 'e.g. Mid-term Objectives',
  subjectLabel: 'Subject',
  subjectPlaceholder: 'e.g. Mathematics',
  classLabel: 'Class',
  selectClass: 'Select class',
  termLabel: 'Term',
  selectTerm: 'Select term',
  timingLabel: 'Timing',
  durationLabel: 'Duration (minutes)',
  testDateLabel: 'Test date',
  scoringLabel: 'Scoring & report card',
  theoryMaxScoreLabel: 'Theory portion max score',
  objectivesOnlyHint: '(0 = objectives only)',
  reportCardComponentLabel: 'Report card component',
  reportCardComponentPlaceholder: 'e.g. "Test" or "Exam"',
  countsTowardReport: 'Counts toward the report card',
  practiceHint: '(practice/mock test — score stays separate)',
  createTestBtn: 'Create test',
  couldNotCreateTest: 'Could not create test',
  couldNotResumeTest: 'Could not load this test to continue adding questions',
  addQuestionsHeading: (title) => `Add questions to "${title}"`,
  downloadQuestionTemplateBtn: 'Download question template (.xlsx)',
  orText: 'or',
  uploadingBtn: 'Uploading…',
  uploadFilledTemplateBtn: 'Upload filled-in template',
  questionsOnTestSoFar: (count) => `${count} question(s) on this test so far.`,
  orAddOneAtATime: 'Or add one question at a time below:',
  multipleChoiceBtn: 'Multiple choice',
  codeChallengeBtn: 'Code challenge',
  codeChallengeDisabledTitle: 'Code challenges are temporarily disabled while a runner bug is fixed',
  codeChallengeComingSoon: '(coming soon)',
  codeChallengeComingSoonNotice: 'Code challenge questions are coming soon — temporarily disabled while a bug is fixed.',
  questionTextPlaceholder: 'Question text',
  optionPlaceholder: (n) => `Option ${n}`,
  correctLabel: 'Correct',
  toolbarHelp: 'Symbol buttons insert into whichever field you last clicked into — question text or any option. Shape buttons always insert into the question text. Typing $...$ directly also works, including when filling in the bulk-upload Excel template offline. Select the radio button next to an option to mark it as the correct answer.',
  addPointLabel: 'Add point',
  addQuestionBtn: 'Add question',
  selectCorrectOptionError: 'Select which option is correct before adding the question.',
  couldNotAddQuestion: 'Could not add question',
  couldNotAddCodeQuestion: 'Could not add code question',
  addedCodeQuestionNotice: (preview, count) => `Added "${preview}" — ${count} question(s) total.`,
  uploadFailedError: 'Upload failed — check the file is a valid .xlsx and try again.',
  uploadAddedWithIssues: (added, total, issues) => `Added ${added} question(s), now ${total} total. ${issues}`,
  uploadAddedSimple: (added, total) => `Added ${added} question(s) — ${total} total on this test now.`,
  questionCardTitle: (n) => `Question ${n}`,
  point: 'pt',
  points: 'pts',
  livePreviewLabel: 'Live preview — what the student sees',
  questionTextPlaceholderPreview: 'Your question text will appear here…',
  optionFallback: (n) => `Option ${n}`,
  assignToLabel: (selected, total) => `Assign to (${selected} of ${total} selected — only selected students are charged and get an attempt)`,
  publishBtn: (count) => `Publish test (debits wallet for ${count} selected student(s))`,
  couldNotPublish: 'Could not publish — check wallet balance and that questions exist',
  publishedNotice: (date, code, url) => `Published for ${date}. Access code: ${code} — write this on the board that day. Students self-serve at ${url}. The code will stop working outside that day's window.`,
  allTestsHeading: (count) => `All tests (${count})`,
  filterAll: 'All',
  minutesAbbrev: 'min',
  ptsAbbrev: 'pts',
  theoryAbbrev: (n) => `+${n} theory`,
  clickToContinue: 'Click to continue adding questions →',
  printPaperBtn: 'Print paper',
  questionsBtn: 'Questions',
  viewScoresBtn: 'View scores',
  previousBtn: 'Previous',
  nextBtn: 'Next',
  pageOf: (page, total) => `Page ${page} of ${total}`,
};

const FR: StaffCbtLabels = {
  pageTitle: 'Épreuves sur ordinateur (CBT)',
  startTestSessionBtn: 'Démarrer une session d\'épreuve',
  loadSetupDataFailed: 'Échec du chargement des données de configuration',
  createTestHeading: 'Créer une épreuve',
  basicsLabel: 'Informations de base',
  titleLabel: 'Titre',
  titlePlaceholder: 'ex. Objectifs de mi-trimestre',
  subjectLabel: 'Matière',
  subjectPlaceholder: 'ex. Mathématiques',
  classLabel: 'Classe',
  selectClass: 'Sélectionner une classe',
  termLabel: 'Trimestre',
  selectTerm: 'Sélectionner un trimestre',
  timingLabel: 'Durée',
  durationLabel: 'Durée (minutes)',
  testDateLabel: "Date de l'épreuve",
  scoringLabel: 'Notation et bulletin',
  theoryMaxScoreLabel: 'Note maximale de la partie théorique',
  objectivesOnlyHint: '(0 = QCM uniquement)',
  reportCardComponentLabel: 'Composant du bulletin',
  reportCardComponentPlaceholder: 'ex. « Contrôle » ou « Examen »',
  countsTowardReport: 'Compte pour le bulletin',
  practiceHint: '(épreuve blanche/entraînement — note conservée séparément)',
  createTestBtn: "Créer l'épreuve",
  couldNotCreateTest: "Impossible de créer l'épreuve",
  couldNotResumeTest: 'Impossible de charger cette épreuve pour continuer à ajouter des questions',
  addQuestionsHeading: (title) => `Ajouter des questions à « ${title} »`,
  downloadQuestionTemplateBtn: 'Télécharger le modèle de questions (.xlsx)',
  orText: 'ou',
  uploadingBtn: 'Téléversement…',
  uploadFilledTemplateBtn: 'Téléverser le modèle rempli',
  questionsOnTestSoFar: (count) => `${count} question(s) sur cette épreuve pour le moment.`,
  orAddOneAtATime: 'Ou ajoutez une question à la fois ci-dessous :',
  multipleChoiceBtn: 'Choix multiple',
  codeChallengeBtn: 'Défi de code',
  codeChallengeDisabledTitle: "Les défis de code sont temporairement désactivés le temps de corriger un bug",
  codeChallengeComingSoon: '(bientôt disponible)',
  codeChallengeComingSoonNotice: 'Les questions de défi de code arrivent bientôt — temporairement désactivées le temps de corriger un bug.',
  questionTextPlaceholder: 'Texte de la question',
  optionPlaceholder: (n) => `Option ${n}`,
  correctLabel: 'Correcte',
  toolbarHelp: "Les boutons de symboles s'insèrent dans le dernier champ cliqué — texte de la question ou toute option. Les boutons de formes s'insèrent toujours dans le texte de la question. Taper $...$ directement fonctionne aussi, y compris en remplissant le modèle Excel hors ligne. Cochez le bouton radio à côté d'une option pour la marquer comme la bonne réponse.",
  addPointLabel: 'Points',
  addQuestionBtn: 'Ajouter la question',
  selectCorrectOptionError: "Sélectionnez quelle option est correcte avant d'ajouter la question.",
  couldNotAddQuestion: "Impossible d'ajouter la question",
  couldNotAddCodeQuestion: 'Impossible d\'ajouter la question de code',
  addedCodeQuestionNotice: (preview, count) => `« ${preview} » ajoutée — ${count} question(s) au total.`,
  uploadFailedError: 'Échec du téléversement — vérifiez que le fichier est un .xlsx valide et réessayez.',
  uploadAddedWithIssues: (added, total, issues) => `${added} question(s) ajoutée(s), ${total} au total maintenant. ${issues}`,
  uploadAddedSimple: (added, total) => `${added} question(s) ajoutée(s) — ${total} au total sur cette épreuve maintenant.`,
  questionCardTitle: (n) => `Question ${n}`,
  point: 'pt',
  points: 'pts',
  livePreviewLabel: 'Aperçu en direct — ce que voit l\'élève',
  questionTextPlaceholderPreview: 'Le texte de votre question apparaîtra ici…',
  optionFallback: (n) => `Option ${n}`,
  assignToLabel: (selected, total) => `Assigner à (${selected} sur ${total} sélectionné(s) — seuls les élèves sélectionnés sont facturés et obtiennent une tentative)`,
  publishBtn: (count) => `Publier l'épreuve (débite le portefeuille pour ${count} élève(s) sélectionné(s))`,
  couldNotPublish: "Impossible de publier — vérifiez le solde du portefeuille et l'existence de questions",
  publishedNotice: (date, code, url) => `Publiée pour le ${date}. Code d'accès : ${code} — écrivez-le au tableau ce jour-là. Les élèves se connectent eux-mêmes sur ${url}. Le code cessera de fonctionner en dehors de la fenêtre de ce jour.`,
  allTestsHeading: (count) => `Toutes les épreuves (${count})`,
  filterAll: 'Toutes',
  minutesAbbrev: 'min',
  ptsAbbrev: 'pts',
  theoryAbbrev: (n) => `+${n} théorie`,
  clickToContinue: 'Cliquez pour continuer à ajouter des questions →',
  printPaperBtn: 'Imprimer le sujet',
  questionsBtn: 'Questions',
  viewScoresBtn: 'Voir les notes',
  previousBtn: 'Précédent',
  nextBtn: 'Suivant',
  pageOf: (page, total) => `Page ${page} sur ${total}`,
};

const STAFF_CBT_LABELS_BY_LOCALE: Record<SupportedLocale, StaffCbtLabels> = {
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

export function staffCbtLabelsFor(locale: string): StaffCbtLabels {
  return STAFF_CBT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? STAFF_CBT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
