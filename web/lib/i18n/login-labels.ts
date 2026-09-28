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

const PT: LoginLabels = {
  signIn: 'Entrar',
  emailLabel: 'E-mail',
  passwordLabel: 'Palavra-passe',
  signingIn: 'A entrar…',
  noSchoolLinked: 'A sua conta ainda não está associada a nenhuma escola. Contacte o administrador da sua escola.',
  serverUnreachable: 'Não foi possível contactar o servidor. Verifique se o backend está em execução e acessível, e se o CORS permite esta origem.',
  forgotPassword: 'Esqueceu-se da palavra-passe?',
  newSchool: 'Escola nova?',
  getStarted: 'Começar',
};

const ES: LoginLabels = {
  signIn: 'Iniciar sesión',
  emailLabel: 'Correo electrónico',
  passwordLabel: 'Contraseña',
  signingIn: 'Iniciando sesión…',
  noSchoolLinked: 'Su cuenta aún no está vinculada a ningún colegio. Comuníquese con el administrador de su colegio.',
  serverUnreachable: 'No se pudo contactar con el servidor. Verifique que el backend esté en ejecución y accesible, y que CORS permita este origen.',
  forgotPassword: '¿Olvidó su contraseña?',
  newSchool: '¿Colegio nuevo?',
  getStarted: 'Comenzar',
};

const LOGIN_LABELS_BY_LOCALE: Record<SupportedLocale, LoginLabels> = { en: EN, fr: FR, pt: PT, es: ES };

export function loginLabelsFor(locale: string): LoginLabels {
  return LOGIN_LABELS_BY_LOCALE[locale as SupportedLocale] ?? LOGIN_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
