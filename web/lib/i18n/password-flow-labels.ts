// web/lib/i18n/password-flow-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface PasswordFlowLabels {
  // forgot-password
  resetYourPassword: string;
  forgotIntro: string;
  emailLabel: string;
  sending: string;
  sendResetLink: string;
  resetLinkSentNotice: string;
  backToSignIn: string;
  // change-password (forced, first login)
  changePasswordHeading: string;
  changePasswordIntro: string;
  currentPasswordLabel: string;
  newPasswordLabel: string;
  confirmNewPasswordLabel: string;
  passwordsDoNotMatch: string;
  saving: string;
  changePasswordBtn: string;
  couldNotChangePassword: string;
  // reset-password (via emailed link)
  chooseNewPasswordHeading: string;
  newPasswordSetNotice: string;
  invalidLinkError: string;
  resetPasswordBtn: string;
  missingTokenError: string;
  requestNewLink: string;
  setNewPasswordBtn: string;
  signIn: string;
}

const EN: PasswordFlowLabels = {
  resetYourPassword: 'Reset your password',
  forgotIntro: "Enter your email and we'll send you a reset link.",
  emailLabel: 'Email',
  sending: 'Sending…',
  sendResetLink: 'Send reset link',
  resetLinkSentNotice: 'If that email is registered, a reset link has been sent.',
  backToSignIn: 'Back to sign in',
  changePasswordHeading: 'Choose a new password',
  changePasswordIntro: 'For security, you need to set a new password before continuing.',
  currentPasswordLabel: 'Current (temporary) password',
  newPasswordLabel: 'New password',
  confirmNewPasswordLabel: 'Confirm new password',
  passwordsDoNotMatch: 'Passwords do not match.',
  saving: 'Saving…',
  changePasswordBtn: 'Change password',
  couldNotChangePassword: 'Could not change password',
  chooseNewPasswordHeading: 'Choose a new password',
  newPasswordSetNotice: 'Your password has been updated. You can now sign in.',
  invalidLinkError: 'This reset link is invalid or has expired.',
  resetPasswordBtn: 'Reset password',
  missingTokenError: 'This link is missing a reset token. Please request a new one.',
  requestNewLink: 'Request a new link',
  setNewPasswordBtn: 'Set new password',
  signIn: 'Sign in',
};

const FR: PasswordFlowLabels = {
  resetYourPassword: 'Réinitialisez votre mot de passe',
  forgotIntro: 'Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation.',
  emailLabel: 'E-mail',
  sending: 'Envoi…',
  sendResetLink: 'Envoyer le lien de réinitialisation',
  resetLinkSentNotice: 'Si cet e-mail est enregistré, un lien de réinitialisation a été envoyé.',
  backToSignIn: 'Retour à la connexion',
  changePasswordHeading: 'Choisissez un nouveau mot de passe',
  changePasswordIntro: 'Pour votre sécurité, vous devez définir un nouveau mot de passe avant de continuer.',
  currentPasswordLabel: 'Mot de passe actuel (temporaire)',
  newPasswordLabel: 'Nouveau mot de passe',
  confirmNewPasswordLabel: 'Confirmez le nouveau mot de passe',
  passwordsDoNotMatch: 'Les mots de passe ne correspondent pas.',
  saving: 'Enregistrement…',
  changePasswordBtn: 'Changer le mot de passe',
  couldNotChangePassword: 'Impossible de changer le mot de passe',
  chooseNewPasswordHeading: 'Choisissez un nouveau mot de passe',
  newPasswordSetNotice: 'Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.',
  invalidLinkError: 'Ce lien de réinitialisation est invalide ou a expiré.',
  resetPasswordBtn: 'Réinitialiser le mot de passe',
  missingTokenError: 'Ce lien ne contient pas de jeton de réinitialisation. Veuillez en demander un nouveau.',
  requestNewLink: 'Demander un nouveau lien',
  setNewPasswordBtn: 'Définir le nouveau mot de passe',
  signIn: 'Se connecter',
};

const PASSWORD_FLOW_LABELS_BY_LOCALE: Record<SupportedLocale, PasswordFlowLabels> = {
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

export function passwordFlowLabelsFor(locale: string): PasswordFlowLabels {
  return PASSWORD_FLOW_LABELS_BY_LOCALE[locale as SupportedLocale] ?? PASSWORD_FLOW_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
