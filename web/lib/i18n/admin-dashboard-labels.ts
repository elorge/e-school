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

const ADMIN_DASHBOARD_LABELS_BY_LOCALE: Record<SupportedLocale, AdminDashboardLabels> = {
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

export function adminDashboardLabelsFor(locale: string): AdminDashboardLabels {
  return ADMIN_DASHBOARD_LABELS_BY_LOCALE[locale as SupportedLocale] ?? ADMIN_DASHBOARD_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
