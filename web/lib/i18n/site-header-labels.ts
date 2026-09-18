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
  signIn: 'Entrar',
  getStarted: 'Começar',
  toggleMenu: 'Alternar menu',
  language: 'Idioma',
};

const SITE_HEADER_LABELS_BY_LOCALE: Record<SupportedLocale, SiteHeaderLabels> = { en: EN, fr: FR, pt: PT };

export function siteHeaderLabelsFor(locale: string): SiteHeaderLabels {
  return SITE_HEADER_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SITE_HEADER_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
