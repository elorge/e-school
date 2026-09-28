// web/lib/i18n/admin-dashboard-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface AdminDashboardLabels {
  pageTitle: string;
  loadFailed: string;
  loadStudentsFailed: string;
  walletBalance: string;
  amountLabel: (currency: string) => string;
  payerEmailLabel: string;
  fundWalletBtn: string;
  couldNotStartPayment: string;
  staffHeading: string;
  inviteByEmailBtn: string;
  setPasswordNowBtn: string;
  fullNameLabel: string;
  emailLabel: string;
  temporaryPasswordLabel: string;
  confirmPasswordLabel: string;
  passwordsDoNotMatch: string;
  savingBtn: string;
  sendInviteBtn: string;
  createAccountBtn: string;
  inviteSentNotice: (email: string) => string;
  accountCreatedNotice: (email: string) => string;
  couldNotCreateStaffAccount: string;
  reassignPlaceholder: string;
  confirmRemovalBtn: string;
  removeBtn: string;
  couldNotRemoveStaffMember: string;
  studentsAndResultsHeading: string;
  selectClass: string;
  noActiveStudents: string;
  pendingId: string;
  enterResultsBtn: string;
}

const EN: AdminDashboardLabels = {
  pageTitle: 'Admin',
  loadFailed: 'Failed to load dashboard',
  loadStudentsFailed: 'Failed to load students for this class',
  walletBalance: 'Wallet balance',
  amountLabel: (currency) => `Amount (${currency})`,
  payerEmailLabel: 'Payer email',
  fundWalletBtn: 'Fund wallet',
  couldNotStartPayment: 'Could not start payment',
  staffHeading: 'Staff',
  inviteByEmailBtn: 'Invite by email',
  setPasswordNowBtn: 'Set password now',
  fullNameLabel: 'Full name',
  emailLabel: 'Email',
  temporaryPasswordLabel: 'Temporary password',
  confirmPasswordLabel: 'Confirm password',
  passwordsDoNotMatch: 'Passwords do not match.',
  savingBtn: 'Saving…',
  sendInviteBtn: 'Send invite',
  createAccountBtn: 'Create account',
  inviteSentNotice: (email) => `Invite sent to ${email} — they'll set their own password to activate the account.`,
  accountCreatedNotice: (email) => `Account created for ${email}. Share the password with them directly — they'll be asked to change it on first login.`,
  couldNotCreateStaffAccount: 'Could not create staff account',
  reassignPlaceholder: 'Reassign their classes/students to…',
  confirmRemovalBtn: 'Confirm removal',
  removeBtn: 'Remove',
  couldNotRemoveStaffMember: 'Could not remove staff member',
  studentsAndResultsHeading: 'Students & Results',
  selectClass: 'Select a class',
  noActiveStudents: 'No active students in this class.',
  pendingId: 'pending ID',
  enterResultsBtn: 'Enter results',
};

const FR: AdminDashboardLabels = {
  pageTitle: 'Administration',
  loadFailed: 'Échec du chargement du tableau de bord',
  loadStudentsFailed: 'Échec du chargement des élèves de cette classe',
  walletBalance: 'Solde du portefeuille',
  amountLabel: (currency) => `Montant (${currency})`,
  payerEmailLabel: 'E-mail du payeur',
  fundWalletBtn: 'Approvisionner le portefeuille',
  couldNotStartPayment: 'Impossible de démarrer le paiement',
  staffHeading: 'Personnel',
  inviteByEmailBtn: 'Inviter par e-mail',
  setPasswordNowBtn: 'Définir le mot de passe maintenant',
  fullNameLabel: 'Nom complet',
  emailLabel: 'E-mail',
  temporaryPasswordLabel: 'Mot de passe temporaire',
  confirmPasswordLabel: 'Confirmer le mot de passe',
  passwordsDoNotMatch: 'Les mots de passe ne correspondent pas.',
  savingBtn: 'Enregistrement…',
  sendInviteBtn: "Envoyer l'invitation",
  createAccountBtn: 'Créer le compte',
  inviteSentNotice: (email) => `Invitation envoyée à ${email} — cette personne définira son propre mot de passe pour activer le compte.`,
  accountCreatedNotice: (email) => `Compte créé pour ${email}. Communiquez-lui le mot de passe directement — il lui sera demandé de le changer à la première connexion.`,
  couldNotCreateStaffAccount: 'Impossible de créer le compte du personnel',
  reassignPlaceholder: 'Réaffecter ses classes/élèves à…',
  confirmRemovalBtn: 'Confirmer la suppression',
  removeBtn: 'Retirer',
  couldNotRemoveStaffMember: 'Impossible de retirer ce membre du personnel',
  studentsAndResultsHeading: 'Élèves et résultats',
  selectClass: 'Sélectionner une classe',
  noActiveStudents: 'Aucun élève actif dans cette classe.',
  pendingId: 'matricule en attente',
  enterResultsBtn: 'Saisir les résultats',
};

const PT: AdminDashboardLabels = {
  pageTitle: 'Administração',
  loadFailed: 'Falha ao carregar o painel',
  loadStudentsFailed: 'Falha ao carregar os alunos desta turma',
  walletBalance: 'Saldo da carteira',
  amountLabel: (currency) => `Valor (${currency})`,
  payerEmailLabel: 'E-mail do pagador',
  fundWalletBtn: 'Carregar carteira',
  couldNotStartPayment: 'Não foi possível iniciar o pagamento',
  staffHeading: 'Pessoal',
  inviteByEmailBtn: 'Convidar por e-mail',
  setPasswordNowBtn: 'Definir palavra-passe agora',
  fullNameLabel: 'Nome completo',
  emailLabel: 'E-mail',
  temporaryPasswordLabel: 'Palavra-passe temporária',
  confirmPasswordLabel: 'Confirmar palavra-passe',
  passwordsDoNotMatch: 'As palavras-passe não coincidem.',
  savingBtn: 'A guardar…',
  sendInviteBtn: 'Enviar convite',
  createAccountBtn: 'Criar conta',
  inviteSentNotice: (email) => `Convite enviado para ${email} — essa pessoa irá definir a sua própria palavra-passe para ativar a conta.`,
  accountCreatedNotice: (email) => `Conta criada para ${email}. Partilhe a palavra-passe diretamente com essa pessoa — ser-lhe-á pedido que a altere no primeiro início de sessão.`,
  couldNotCreateStaffAccount: 'Não foi possível criar a conta do pessoal',
  reassignPlaceholder: 'Reatribuir as suas turmas/alunos a…',
  confirmRemovalBtn: 'Confirmar remoção',
  removeBtn: 'Remover',
  couldNotRemoveStaffMember: 'Não foi possível remover este membro do pessoal',
  studentsAndResultsHeading: 'Alunos e Resultados',
  selectClass: 'Selecione uma turma',
  noActiveStudents: 'Nenhum aluno ativo nesta turma.',
  pendingId: 'matrícula pendente',
  enterResultsBtn: 'Inserir resultados',
};

const ES: AdminDashboardLabels = {
  pageTitle: 'Administración',
  loadFailed: 'Error al cargar el panel',
  loadStudentsFailed: 'Error al cargar los alumnos de esta clase',
  walletBalance: 'Saldo de la billetera',
  amountLabel: (currency) => `Monto (${currency})`,
  payerEmailLabel: 'Correo del pagador',
  fundWalletBtn: 'Recargar billetera',
  couldNotStartPayment: 'No se pudo iniciar el pago',
  staffHeading: 'Personal',
  inviteByEmailBtn: 'Invitar por correo electrónico',
  setPasswordNowBtn: 'Establecer contraseña ahora',
  fullNameLabel: 'Nombre completo',
  emailLabel: 'Correo electrónico',
  temporaryPasswordLabel: 'Contraseña temporal',
  confirmPasswordLabel: 'Confirmar contraseña',
  passwordsDoNotMatch: 'Las contraseñas no coinciden.',
  savingBtn: 'Guardando…',
  sendInviteBtn: 'Enviar invitación',
  createAccountBtn: 'Crear cuenta',
  inviteSentNotice: (email) => `Invitación enviada a ${email}: esa persona establecerá su propia contraseña para activar la cuenta.`,
  accountCreatedNotice: (email) => `Cuenta creada para ${email}. Comparta la contraseña directamente con esa persona; se le pedirá que la cambie en su primer inicio de sesión.`,
  couldNotCreateStaffAccount: 'No se pudo crear la cuenta del personal',
  reassignPlaceholder: 'Reasignar sus clases/alumnos a…',
  confirmRemovalBtn: 'Confirmar eliminación',
  removeBtn: 'Quitar',
  couldNotRemoveStaffMember: 'No se pudo quitar a este miembro del personal',
  studentsAndResultsHeading: 'Alumnos y resultados',
  selectClass: 'Seleccione una clase',
  noActiveStudents: 'No hay alumnos activos en esta clase.',
  pendingId: 'matrícula pendiente',
  enterResultsBtn: 'Ingresar resultados',
};

const ADMIN_DASHBOARD_LABELS_BY_LOCALE: Record<SupportedLocale, AdminDashboardLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function adminDashboardLabelsFor(locale: string): AdminDashboardLabels {
  return ADMIN_DASHBOARD_LABELS_BY_LOCALE[locale as SupportedLocale] ?? ADMIN_DASHBOARD_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
