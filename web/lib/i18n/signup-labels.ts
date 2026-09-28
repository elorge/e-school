// web/lib/i18n/signup-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface SignupLabels {
  heading: string;
  subheading: string;
  requestReceivedTitle: string;
  requestReceivedBody: (email: string) => string;
  backToHome: string;
  countryLabel: string;
  selectYourCountry: string;
  billedInCurrency: (currency: string) => string;
  languageLabel: string;
  selectCountryFirst: string;
  languageHelp: string;
  schoolNameLabel: string;
  workspaceNameLabel: string;
  schoolCodeLabel: string;
  yourNameLabel: string;
  yourEmailLabel: string;
  choosePasswordLabel: string;
  confirmPasswordLabel: string;
  phoneLabel: string;
  passwordsDoNotMatch: string;
  selectCountryError: string;
  selectLanguageError: string;
  genericError: string;
  consentPrefix: string;
  termsLink: string;
  andText: string;
  privacyLink: string;
  submitting: string;
  requestAccess: string;
  alreadyHaveAccount: string;
  signIn: string;
}

const EN: SignupLabels = {
  heading: 'Bring your school onto Elorge',
  subheading: 'Wherever your school is, tell us a bit about it. Our team reviews every request and activates your workspace, usually within one business day.',
  requestReceivedTitle: 'Request received.',
  requestReceivedBody: (email) => `We'll email ${email} once your workspace is ready.`,
  backToHome: 'Back to home',
  countryLabel: 'Country',
  selectYourCountry: 'Select your country',
  billedInCurrency: (currency) => `Your school will be billed in ${currency}.`,
  languageLabel: 'Language',
  selectCountryFirst: 'Select your country first',
  languageHelp: 'Report cards, CBT screens, and emails from us will be in this language. You can change it later.',
  schoolNameLabel: 'School name',
  workspaceNameLabel: 'Workspace name (used in your web address)',
  schoolCodeLabel: 'School code (2-10 letters/numbers, used on Admission IDs)',
  yourNameLabel: 'Your name (School Admin)',
  yourEmailLabel: 'Your email',
  choosePasswordLabel: 'Choose a password',
  confirmPasswordLabel: 'Confirm password',
  phoneLabel: 'Phone (optional)',
  passwordsDoNotMatch: 'Passwords do not match.',
  selectCountryError: 'Please select your country.',
  selectLanguageError: 'Please select a language.',
  genericError: 'Something went wrong. Please try again.',
  consentPrefix: 'I confirm my school has lawful consent to submit student data, and agree to the',
  termsLink: 'Terms',
  andText: 'and',
  privacyLink: 'Privacy Policy',
  submitting: 'Submitting…',
  requestAccess: 'Request access',
  alreadyHaveAccount: 'Already have an account?',
  signIn: 'Sign in',
};

const FR: SignupLabels = {
  heading: 'Rejoignez Elorge avec votre école',
  subheading: "Où que soit votre école, parlez-nous-en un peu. Notre équipe examine chaque demande et active votre espace de travail, généralement sous un jour ouvré.",
  requestReceivedTitle: 'Demande reçue.',
  requestReceivedBody: (email) => `Nous enverrons un e-mail à ${email} dès que votre espace de travail sera prêt.`,
  backToHome: "Retour à l'accueil",
  countryLabel: 'Pays',
  selectYourCountry: 'Sélectionnez votre pays',
  billedInCurrency: (currency) => `Votre école sera facturée en ${currency}.`,
  languageLabel: 'Langue',
  selectCountryFirst: "Sélectionnez d'abord votre pays",
  languageHelp: 'Les bulletins, écrans CBT et e-mails que nous envoyons seront dans cette langue. Vous pourrez la changer plus tard.',
  schoolNameLabel: "Nom de l'école",
  workspaceNameLabel: "Nom de l'espace de travail (utilisé dans votre adresse web)",
  schoolCodeLabel: "Code de l'école (2 à 10 lettres/chiffres, utilisé pour les matricules)",
  yourNameLabel: 'Votre nom (administrateur de l\'école)',
  yourEmailLabel: 'Votre e-mail',
  choosePasswordLabel: 'Choisissez un mot de passe',
  confirmPasswordLabel: 'Confirmez le mot de passe',
  phoneLabel: 'Téléphone (facultatif)',
  passwordsDoNotMatch: 'Les mots de passe ne correspondent pas.',
  selectCountryError: 'Veuillez sélectionner votre pays.',
  selectLanguageError: 'Veuillez sélectionner une langue.',
  genericError: "Une erreur s'est produite. Veuillez réessayer.",
  consentPrefix: "Je confirme que mon école dispose du consentement légal pour soumettre des données d'élèves, et j'accepte les",
  termsLink: "conditions d'utilisation",
  andText: 'et la',
  privacyLink: 'politique de confidentialité',
  submitting: 'Envoi…',
  requestAccess: "Demander l'accès",
  alreadyHaveAccount: 'Vous avez déjà un compte ?',
  signIn: 'Se connecter',
};

const PT: SignupLabels = {
  heading: 'Traga a sua escola para a Elorge',
  subheading: 'Onde quer que a sua escola esteja, conte-nos um pouco sobre ela. A nossa equipa analisa cada pedido e ativa o seu espaço de trabalho, normalmente dentro de um dia útil.',
  requestReceivedTitle: 'Pedido recebido.',
  requestReceivedBody: (email) => `Enviaremos um e-mail para ${email} assim que o seu espaço de trabalho estiver pronto.`,
  backToHome: 'Voltar ao início',
  countryLabel: 'País',
  selectYourCountry: 'Selecione o seu país',
  billedInCurrency: (currency) => `A sua escola será faturada em ${currency}.`,
  languageLabel: 'Idioma',
  selectCountryFirst: 'Selecione primeiro o seu país',
  languageHelp: 'Os boletins, ecrãs CBT e e-mails que enviamos serão neste idioma. Pode alterá-lo mais tarde.',
  schoolNameLabel: 'Nome da escola',
  workspaceNameLabel: 'Nome do espaço de trabalho (usado no seu endereço web)',
  schoolCodeLabel: 'Código da escola (2 a 10 letras/números, usado nos números de matrícula)',
  yourNameLabel: 'O seu nome (Administrador da Escola)',
  yourEmailLabel: 'O seu e-mail',
  choosePasswordLabel: 'Escolha uma palavra-passe',
  confirmPasswordLabel: 'Confirme a palavra-passe',
  phoneLabel: 'Telefone (opcional)',
  passwordsDoNotMatch: 'As palavras-passe não coincidem.',
  selectCountryError: 'Por favor, selecione o seu país.',
  selectLanguageError: 'Por favor, selecione um idioma.',
  genericError: 'Ocorreu um erro. Por favor, tente novamente.',
  consentPrefix: 'Confirmo que a minha escola tem consentimento legal para submeter dados de alunos, e concordo com os',
  termsLink: 'Termos',
  andText: 'e a',
  privacyLink: 'Política de Privacidade',
  submitting: 'A submeter…',
  requestAccess: 'Solicitar acesso',
  alreadyHaveAccount: 'Já tem uma conta?',
  signIn: 'Iniciar sessão',
};

const ES: SignupLabels = {
  heading: 'Sume a su colegio a Elorge',
  subheading: 'Dondequiera que esté su colegio, cuéntenos un poco sobre él. Nuestro equipo revisa cada solicitud y activa su espacio de trabajo, generalmente dentro de un día hábil.',
  requestReceivedTitle: 'Solicitud recibida.',
  requestReceivedBody: (email) => `Le enviaremos un correo a ${email} en cuanto su espacio de trabajo esté listo.`,
  backToHome: 'Volver al inicio',
  countryLabel: 'País',
  selectYourCountry: 'Seleccione su país',
  billedInCurrency: (currency) => `A su colegio se le facturará en ${currency}.`,
  languageLabel: 'Idioma',
  selectCountryFirst: 'Seleccione primero su país',
  languageHelp: 'Las boletas de calificaciones, las pantallas de CBT y los correos que enviemos estarán en este idioma. Puede cambiarlo más adelante.',
  schoolNameLabel: 'Nombre del colegio',
  workspaceNameLabel: 'Nombre del espacio de trabajo (se usa en su dirección web)',
  schoolCodeLabel: 'Código del colegio (2 a 10 letras/números, usado en los números de matrícula)',
  yourNameLabel: 'Su nombre (Administrador del colegio)',
  yourEmailLabel: 'Su correo electrónico',
  choosePasswordLabel: 'Elija una contraseña',
  confirmPasswordLabel: 'Confirme la contraseña',
  phoneLabel: 'Teléfono (opcional)',
  passwordsDoNotMatch: 'Las contraseñas no coinciden.',
  selectCountryError: 'Seleccione su país.',
  selectLanguageError: 'Seleccione un idioma.',
  genericError: 'Ocurrió un error. Inténtelo de nuevo.',
  consentPrefix: 'Confirmo que mi colegio cuenta con el consentimiento legal para enviar datos de alumnos, y acepto los',
  termsLink: 'Términos',
  andText: 'y la',
  privacyLink: 'Política de Privacidad',
  submitting: 'Enviando…',
  requestAccess: 'Solicitar acceso',
  alreadyHaveAccount: '¿Ya tiene una cuenta?',
  signIn: 'Iniciar sesión',
};

const SIGNUP_LABELS_BY_LOCALE: Record<SupportedLocale, SignupLabels> = {
  en: EN,
  fr: FR,
  pt: PT,
  es: ES,
};

export function signupLabelsFor(locale: string): SignupLabels {
  return SIGNUP_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SIGNUP_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
