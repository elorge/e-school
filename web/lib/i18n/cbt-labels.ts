// web/lib/i18n/cbt-labels.ts
/**
 * Every fixed UI string in the student-facing CBT screen (see
 * components/CbtSessionRunner.tsx), keyed by the school's locale.
 *
 * This does NOT translate school-entered content: question text, answer
 * options, and subject/test names are whatever the teacher typed in and
 * render as-is regardless of locale — only the platform's own chrome
 * (buttons, headings, the instructions panel) comes from here.
 */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface CbtLabels {
  testSubmitted: string;
  submittedOffline: string;
  submittedOnline: string;
  quizInstructions: string;
  purposeLabel: string;
  defaultPurpose: (questionCount: number) => string;
  conditionsLabel: string;
  defaultConditions: string;
  startedAt: string;
  at: string;
  question: string;
  point: string;
  points: string;
  answered: string;
  left: string;
  submitQuiz: string;
  toggleMenu: string;
  toggleInstructions: string;
  loginTitle: string;
  loginSubtitle: string;
  admissionIdLabel: string;
  accessCodeLabel: string;
  loginError: string;
  beginTest: string;
  startingTest: string;
  startCbtSessionHeading: string;
  selectClassOption: string;
  selectStudentOption: string;
  selectTestOption: string;
  couldNotStartTest: string;
  sessionEndedHeading: string;
  startAnotherSessionBtn: string;
}

const EN: CbtLabels = {
  testSubmitted: 'Test submitted',
  submittedOffline:
    "No internet right now — your submission is saved on this device and will finish syncing automatically. Please don't close this tab yet.",
  submittedOnline: 'Successfully submitted.',
  quizInstructions: 'Quiz Instructions',
  purposeLabel: 'Purpose:',
  defaultPurpose: (n) => `Complete all ${n} question(s) below. Your answers save automatically as you go.`,
  conditionsLabel: 'Conditions:',
  defaultConditions: 'Stay on this page until you submit. Once time runs out, the quiz submits itself.',
  startedAt: 'Started:',
  at: 'at',
  question: 'Question',
  point: 'pt',
  points: 'pts',
  answered: 'answered',
  left: 'left',
  submitQuiz: 'Submit Quiz',
  toggleMenu: 'Menu',
  toggleInstructions: 'Toggle instructions',
  loginTitle: 'Start your test',
  loginSubtitle: 'Enter your Admission ID and the access code your teacher shared today.',
  admissionIdLabel: 'Admission ID',
  accessCodeLabel: 'Access code',
  loginError: 'Could not start the test — check your Admission ID and access code.',
  beginTest: 'Begin test',
  startingTest: 'Starting…',
  startCbtSessionHeading: 'Start a CBT session',
  selectClassOption: 'Select class',
  selectStudentOption: 'Select student',
  selectTestOption: 'Select test',
  couldNotStartTest: 'Could not start this test — check the test is published and this student is assigned to it.',
  sessionEndedHeading: 'Session ended',
  startAnotherSessionBtn: 'Start another session',
};

const FR: CbtLabels = {
  testSubmitted: 'Épreuve soumise',
  submittedOffline:
    "Pas de connexion internet pour le moment — votre soumission est enregistrée sur cet appareil et se synchronisera automatiquement. Merci de ne pas fermer cet onglet.",
  submittedOnline: 'Soumission réussie.',
  quizInstructions: "Instructions de l'épreuve",
  purposeLabel: 'Objectif :',
  defaultPurpose: (n) => `Répondez aux ${n} question(s) ci-dessous. Vos réponses s'enregistrent automatiquement.`,
  conditionsLabel: 'Conditions :',
  defaultConditions: "Restez sur cette page jusqu'à la soumission. Une fois le temps écoulé, l'épreuve se soumet automatiquement.",
  startedAt: 'Débuté :',
  at: 'à',
  question: 'Question',
  point: 'pt',
  points: 'pts',
  answered: 'répondu(es)',
  left: 'restant',
  submitQuiz: "Soumettre l'épreuve",
  toggleMenu: 'Menu',
  toggleInstructions: 'Afficher/masquer les instructions',
  loginTitle: 'Commencez votre épreuve',
  loginSubtitle: "Saisissez votre matricule et le code d'accès communiqué par votre enseignant aujourd'hui.",
  admissionIdLabel: 'Matricule',
  accessCodeLabel: "Code d'accès",
  loginError: "Impossible de démarrer l'épreuve — vérifiez votre matricule et le code d'accès.",
  beginTest: "Commencer l'épreuve",
  startingTest: 'Démarrage…',
  startCbtSessionHeading: 'Démarrer une session CBT',
  selectClassOption: 'Sélectionner une classe',
  selectStudentOption: 'Sélectionner un élève',
  selectTestOption: 'Sélectionner une épreuve',
  couldNotStartTest: "Impossible de démarrer cette épreuve — vérifiez qu'elle est publiée et que cet élève y est assigné.",
  sessionEndedHeading: 'Session terminée',
  startAnotherSessionBtn: 'Démarrer une autre session',
};

const PT: CbtLabels = {
  testSubmitted: 'Prova submetida',
  submittedOffline:
    'Sem internet neste momento — a sua submissão está guardada neste dispositivo e será sincronizada automaticamente. Por favor, não feche este separador ainda.',
  submittedOnline: 'Submetido com sucesso.',
  quizInstructions: 'Instruções da Prova',
  purposeLabel: 'Objetivo:',
  defaultPurpose: (n) => `Responda a todas as ${n} pergunta(s) abaixo. As suas respostas são guardadas automaticamente à medida que avança.`,
  conditionsLabel: 'Condições:',
  defaultConditions: 'Permaneça nesta página até submeter. Assim que o tempo terminar, a prova é submetida automaticamente.',
  startedAt: 'Iniciado:',
  at: 'às',
  question: 'Pergunta',
  point: 'pt',
  points: 'pts',
  answered: 'respondidas',
  left: 'restantes',
  submitQuiz: 'Submeter Prova',
  toggleMenu: 'Menu',
  toggleInstructions: 'Mostrar/ocultar instruções',
  loginTitle: 'Inicie a sua prova',
  loginSubtitle: 'Insira o seu Número de Matrícula e o código de acesso partilhado pelo seu professor hoje.',
  admissionIdLabel: 'Número de Matrícula',
  accessCodeLabel: 'Código de acesso',
  loginError: 'Não foi possível iniciar a prova — verifique o seu Número de Matrícula e o código de acesso.',
  beginTest: 'Iniciar prova',
  startingTest: 'A iniciar…',
  startCbtSessionHeading: 'Iniciar uma sessão CBT',
  selectClassOption: 'Selecionar turma',
  selectStudentOption: 'Selecionar aluno',
  selectTestOption: 'Selecionar prova',
  couldNotStartTest: 'Não foi possível iniciar esta prova — verifique se está publicada e se este aluno está atribuído a ela.',
  sessionEndedHeading: 'Sessão terminada',
  startAnotherSessionBtn: 'Iniciar outra sessão',
};

const ES: CbtLabels = {
  testSubmitted: 'Examen enviado',
  submittedOffline:
    'No hay conexión a internet en este momento; su envío se guardó en este dispositivo y terminará de sincronizarse automáticamente. Por favor, no cierre esta pestaña todavía.',
  submittedOnline: 'Enviado con éxito.',
  quizInstructions: 'Instrucciones del examen',
  purposeLabel: 'Propósito:',
  defaultPurpose: (n) => `Complete las ${n} pregunta(s) a continuación. Sus respuestas se guardan automáticamente mientras avanza.`,
  conditionsLabel: 'Condiciones:',
  defaultConditions: 'Permanezca en esta página hasta enviar. Cuando se acabe el tiempo, el examen se enviará automáticamente.',
  startedAt: 'Iniciado:',
  at: 'a las',
  question: 'Pregunta',
  point: 'pto',
  points: 'ptos',
  answered: 'respondidas',
  left: 'restantes',
  submitQuiz: 'Enviar examen',
  toggleMenu: 'Menú',
  toggleInstructions: 'Mostrar/ocultar instrucciones',
  loginTitle: 'Comience su examen',
  loginSubtitle: 'Ingrese su número de matrícula y el código de acceso que le compartió su docente hoy.',
  admissionIdLabel: 'Número de matrícula',
  accessCodeLabel: 'Código de acceso',
  loginError: 'No se pudo iniciar el examen; verifique su número de matrícula y el código de acceso.',
  beginTest: 'Comenzar examen',
  startingTest: 'Iniciando…',
  startCbtSessionHeading: 'Iniciar una sesión de CBT',
  selectClassOption: 'Seleccionar clase',
  selectStudentOption: 'Seleccionar alumno',
  selectTestOption: 'Seleccionar examen',
  couldNotStartTest: 'No se pudo iniciar este examen; verifique que esté publicado y que el alumno esté asignado a él.',
  sessionEndedHeading: 'Sesión finalizada',
  startAnotherSessionBtn: 'Iniciar otra sesión',
};

const CBT_LABELS_BY_LOCALE: Record<SupportedLocale, CbtLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function cbtLabelsFor(locale: string): CbtLabels {
  return CBT_LABELS_BY_LOCALE[locale as SupportedLocale] ?? CBT_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
