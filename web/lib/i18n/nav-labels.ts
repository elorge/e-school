// web/lib/i18n/nav-labels.ts
/** Every fixed string in the dashboard nav shell (components/SchoolNav.tsx). */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface NavLabels {
  logOut: string;
  admin: string;
  settings: string;
  auditLog: string;
  academic: string;
  documents: string;
  finance: string;
  checkResult: string;
  lessons: string;
  students: string;
  lessonNotes: string;
  cbt: string;
  sessionWrap: string;
  classes: string;
  promoteStudents: string;
  terms: string;
  calendar: string;
  gradingWeights: string;
  generatePins: string;
  fees: string;
  inventory: string;
  accounting: string;
  hr: string;
  staffDirectory: string;
  payroll: string;
  leave: string;
  myInfo: string;
}

const EN: NavLabels = {
  logOut: 'Log out',
  admin: 'Admin',
  settings: 'Settings',
  auditLog: 'Audit Log',
  academic: 'Academic',
  documents: 'Documents',
  finance: 'Finance',
  checkResult: 'Check Result',
  lessons: 'Lessons',
  students: 'Students',
  lessonNotes: 'Lesson Notes',
  cbt: 'CBT',
  sessionWrap: 'Session Wrap',
  classes: 'Classes',
  promoteStudents: 'Promote Students',
  terms: 'Terms',
  calendar: 'Calendar',
  gradingWeights: 'Grading Weights',
  generatePins: 'Generate PINs',
  fees: 'Fees',
  inventory: 'Inventory',
  accounting: 'Accounting',
  hr: 'Staff (HR)',
  staffDirectory: 'Staff Directory',
  payroll: 'Payroll',
  leave: 'Leave',
  myInfo: 'My Info',
};

const FR: NavLabels = {
  logOut: 'Déconnexion',
  admin: 'Administration',
  settings: 'Paramètres',
  auditLog: "Journal d'audit",
  academic: 'Académique',
  documents: 'Documents',
  finance: 'Finances',
  checkResult: 'Vérifier un résultat',
  lessons: 'Cours',
  students: 'Élèves',
  lessonNotes: 'Notes de cours',
  cbt: 'Épreuves (CBT)',
  sessionWrap: "Bilan de l'année",
  classes: 'Classes',
  promoteStudents: 'Promouvoir les élèves',
  terms: 'Trimestres',
  calendar: 'Calendrier',
  gradingWeights: 'Pondération des notes',
  generatePins: 'Générer des codes PIN',
  fees: 'Frais scolaires',
  inventory: 'Inventaire',
  accounting: 'Comptabilité',
  hr: 'Personnel (RH)',
  staffDirectory: 'Répertoire du personnel',
  payroll: 'Paie',
  leave: 'Congés',
  myInfo: 'Mes informations',
};

const PT: NavLabels = {
  logOut: 'Sair',
  admin: 'Administração',
  settings: 'Configurações',
  auditLog: 'Registo de Auditoria',
  academic: 'Académico',
  documents: 'Documentos',
  finance: 'Finanças',
  checkResult: 'Consultar Resultado',
  lessons: 'Aulas',
  students: 'Alunos',
  lessonNotes: 'Planos de Aula',
  cbt: 'Provas (CBT)',
  sessionWrap: 'Resumo do Ano Letivo',
  classes: 'Turmas',
  promoteStudents: 'Promover Alunos',
  terms: 'Períodos Letivos',
  calendar: 'Calendário',
  gradingWeights: 'Ponderação das Notas',
  generatePins: 'Gerar PINs',
  fees: 'Propinas',
  inventory: 'Inventário',
  accounting: 'Contabilidade',
  hr: 'Pessoal (RH)',
  staffDirectory: 'Diretório de Pessoal',
  payroll: 'Folha de Pagamento',
  leave: 'Licenças',
  myInfo: 'Minhas Informações',
};

const NAV_LABELS_BY_LOCALE: Record<SupportedLocale, NavLabels> = { en: EN, fr: FR, pt: PT };

export function navLabelsFor(locale: string): NavLabels {
  return NAV_LABELS_BY_LOCALE[locale as SupportedLocale] ?? NAV_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
