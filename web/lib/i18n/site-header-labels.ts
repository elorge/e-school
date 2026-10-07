// web/lib/i18n/site-header-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface SiteHeaderLabels {
  sectionFeatures: string;
  sectionSessionWrap: string;
  sectionCbt: string;
  sectionFinance: string;
  sectionLessonNotes: string;
  sectionOffline: string;
  sectionInfrastructure: string;
  checkResult: string;
  pricing: string;
  bookDemo: string;
  signIn: string;
  getStarted: string;
  toggleMenu: string;
  language: string;
}

const EN: SiteHeaderLabels = {
  sectionFeatures: 'Features',
  sectionSessionWrap: 'Session Wrap',
  sectionCbt: 'CBT',
  sectionFinance: 'Finance',
  sectionLessonNotes: 'Lesson Notes',
  sectionOffline: 'Offline-first',
  sectionInfrastructure: 'Hardware',
  checkResult: 'Check Result',
  pricing: 'Pricing',
  bookDemo: 'Book a demo',
  signIn: 'Sign in',
  getStarted: 'Get started',
  toggleMenu: 'Toggle menu',
  language: 'Language',
};

const FR: SiteHeaderLabels = {
  sectionFeatures: 'Fonctionnalités',
  sectionSessionWrap: "Bilan de l'année",
  sectionCbt: 'CBT',
  sectionFinance: 'Finances',
  sectionLessonNotes: 'Notes de cours',
  sectionOffline: 'Hors ligne',
  sectionInfrastructure: 'Matériel',
  checkResult: 'Vérifier un résultat',
  pricing: 'Tarifs',
  bookDemo: 'Réserver une démo',
  signIn: 'Se connecter',
  getStarted: 'Commencer',
  toggleMenu: 'Basculer le menu',
  language: 'Langue',
};

const PT: SiteHeaderLabels = {
  sectionFeatures: 'Funcionalidades',
  sectionSessionWrap: 'Resumo do Ano Letivo',
  sectionCbt: 'Provas (CBT)',
  sectionFinance: 'Finanças',
  sectionLessonNotes: 'Planos de Aula',
  sectionOffline: 'Funciona Offline',
  sectionInfrastructure: 'Equipamento',
  checkResult: 'Consultar Resultado',
  pricing: 'Preços',
  bookDemo: 'Agendar demonstração',
  signIn: 'Entrar',
  getStarted: 'Começar',
  toggleMenu: 'Alternar menu',
  language: 'Idioma',
};

const ES: SiteHeaderLabels = {
  sectionFeatures: 'Funciones',
  sectionSessionWrap: 'Resumen del Año Escolar',
  sectionCbt: 'CBT',
  sectionFinance: 'Finanzas',
  sectionLessonNotes: 'Notas de Clase',
  sectionOffline: 'Funciona sin conexión',
  sectionInfrastructure: 'Equipo',
  checkResult: 'Consultar Resultado',
  pricing: 'Precios',
  bookDemo: 'Reservar demostración',
  signIn: 'Iniciar sesión',
  getStarted: 'Comenzar',
  toggleMenu: 'Alternar menú',
  language: 'Idioma',
};

const SITE_HEADER_LABELS_BY_LOCALE: Record<SupportedLocale, SiteHeaderLabels> = { en: EN, fr: FR, pt: PT, es: ES };

export function siteHeaderLabelsFor(locale: string): SiteHeaderLabels {
  return SITE_HEADER_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SITE_HEADER_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
