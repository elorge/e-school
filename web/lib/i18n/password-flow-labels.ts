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

const PT: PasswordFlowLabels = {
  resetYourPassword: 'Redefina a sua palavra-passe',
  forgotIntro: 'Insira o seu e-mail e enviaremos um link de redefinição.',
  emailLabel: 'E-mail',
  sending: 'A enviar…',
  sendResetLink: 'Enviar link de redefinição',
  resetLinkSentNotice: 'Se esse e-mail estiver registado, foi enviado um link de redefinição.',
  backToSignIn: 'Voltar ao início de sessão',
  changePasswordHeading: 'Escolha uma nova palavra-passe',
  changePasswordIntro: 'Por segurança, precisa de definir uma nova palavra-passe antes de continuar.',
  currentPasswordLabel: 'Palavra-passe atual (temporária)',
  newPasswordLabel: 'Nova palavra-passe',
  confirmNewPasswordLabel: 'Confirme a nova palavra-passe',
  passwordsDoNotMatch: 'As palavras-passe não coincidem.',
  saving: 'A guardar…',
  changePasswordBtn: 'Alterar palavra-passe',
  couldNotChangePassword: 'Não foi possível alterar a palavra-passe',
  chooseNewPasswordHeading: 'Escolha uma nova palavra-passe',
  newPasswordSetNotice: 'A sua palavra-passe foi atualizada. Já pode iniciar sessão.',
  invalidLinkError: 'Este link de redefinição é inválido ou expirou.',
  resetPasswordBtn: 'Redefinir palavra-passe',
  missingTokenError: 'Este link não contém um token de redefinição. Por favor, solicite um novo.',
  requestNewLink: 'Solicitar um novo link',
  setNewPasswordBtn: 'Definir nova palavra-passe',
  signIn: 'Iniciar sessão',
};

const ES: PasswordFlowLabels = {
  resetYourPassword: 'Restablezca su contraseña',
  forgotIntro: 'Ingrese su correo electrónico y le enviaremos un enlace para restablecerla.',
  emailLabel: 'Correo electrónico',
  sending: 'Enviando…',
  sendResetLink: 'Enviar enlace de restablecimiento',
  resetLinkSentNotice: 'Si ese correo está registrado, se ha enviado un enlace de restablecimiento.',
  backToSignIn: 'Volver a iniciar sesión',
  changePasswordHeading: 'Elija una nueva contraseña',
  changePasswordIntro: 'Por seguridad, debe establecer una nueva contraseña antes de continuar.',
  currentPasswordLabel: 'Contraseña actual (temporal)',
  newPasswordLabel: 'Nueva contraseña',
  confirmNewPasswordLabel: 'Confirmar nueva contraseña',
  passwordsDoNotMatch: 'Las contraseñas no coinciden.',
  saving: 'Guardando…',
  changePasswordBtn: 'Cambiar contraseña',
  couldNotChangePassword: 'No se pudo cambiar la contraseña',
  chooseNewPasswordHeading: 'Elija una nueva contraseña',
  newPasswordSetNotice: 'Su contraseña se actualizó. Ahora puede iniciar sesión.',
  invalidLinkError: 'Este enlace de restablecimiento no es válido o ha caducado.',
  resetPasswordBtn: 'Restablecer contraseña',
  missingTokenError: 'A este enlace le falta un token de restablecimiento. Solicite uno nuevo.',
  requestNewLink: 'Solicitar un nuevo enlace',
  setNewPasswordBtn: 'Establecer nueva contraseña',
  signIn: 'Iniciar sesión',
};

const PASSWORD_FLOW_LABELS_BY_LOCALE: Record<SupportedLocale, PasswordFlowLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function passwordFlowLabelsFor(locale: string): PasswordFlowLabels {
  return PASSWORD_FLOW_LABELS_BY_LOCALE[locale as SupportedLocale] ?? PASSWORD_FLOW_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
