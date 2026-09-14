// web/lib/i18n/login-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface LoginLabels {
  signIn: string;
  emailLabel: string;
  passwordLabel: string;
  signingIn: string;
  noSchoolLinked: string;
  serverUnreachable: string;
  forgotPassword: string;
  newSchool: string;
  getStarted: string;
}

const EN: LoginLabels = {
  signIn: 'Sign in',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  signingIn: 'Signing in…',
  noSchoolLinked: 'Your account is not linked to a school workspace yet. Contact your school administrator.',
  serverUnreachable: 'Could not reach the server. Check that the backend is running and reachable, and that CORS allows this origin.',
  forgotPassword: 'Forgot your password?',
  newSchool: 'New school?',
  getStarted: 'Get started',
};

const FR: LoginLabels = {
  signIn: 'Se connecter',
  emailLabel: 'E-mail',
  passwordLabel: 'Mot de passe',
  signingIn: 'Connexion…',
  noSchoolLinked: "Votre compte n'est pas encore lié à un espace de travail d'école. Contactez l'administrateur de votre école.",
  serverUnreachable: "Impossible de joindre le serveur. Vérifiez que le backend fonctionne et est accessible, et que le CORS autorise cette origine.",
  forgotPassword: 'Mot de passe oublié ?',
  newSchool: 'Nouvelle école ?',
  getStarted: 'Commencer',
};

const LOGIN_LABELS_BY_LOCALE: Record<SupportedLocale, LoginLabels> = { en: EN, fr: FR };

export function loginLabelsFor(locale: string): LoginLabels {
  return LOGIN_LABELS_BY_LOCALE[locale as SupportedLocale] ?? LOGIN_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
