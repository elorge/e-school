// web/lib/i18n/site-footer-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface SiteFooterLabels {
  tagline: string;
  productHeading: string;
  companyHeading: string;
  getInTouchHeading: string;
  chatOnWhatsApp: string;
  getStarted: string;
  copyright: string;
  linkFeatures: string;
  linkSessionWrap: string;
  linkCbt: string;
  linkFinance: string;
  linkLessonNotes: string;
  linkCheckResult: string;
  linkOffline: string;
  linkAbout: string;
  linkCareers: string;
  linkContact: string;
  linkTerms: string;
  linkPrivacy: string;
}

const EN: SiteFooterLabels = {
  tagline: "School management built for schools across Africa and beyond — records, results, and finances that work even when the internet doesn't.",
  productHeading: 'Product',
  companyHeading: 'Company',
  getInTouchHeading: 'Get in touch',
  chatOnWhatsApp: 'Chat on WhatsApp',
  getStarted: 'Get started →',
  copyright: 'Elorge Technologies Limited — Software Development & IT Infrastructure',
  linkFeatures: 'Features',
  linkSessionWrap: 'Session Wrap',
  linkCbt: 'Computer-Based Testing',
  linkFinance: 'Fees, Inventory & Accounting',
  linkLessonNotes: 'Lesson Notes',
  linkCheckResult: 'Check a Result',
  linkOffline: 'Offline-first',
  linkAbout: 'About',
  linkCareers: 'Careers',
  linkContact: 'Contact',
  linkTerms: 'Terms of Service',
  linkPrivacy: 'Privacy Policy',
};

const FR: SiteFooterLabels = {
  tagline: "Gestion scolaire conçue pour les écoles — dossiers, résultats et finances qui fonctionnent même quand internet ne fonctionne pas.",
  productHeading: 'Produit',
  companyHeading: 'Entreprise',
  getInTouchHeading: 'Nous contacter',
  chatOnWhatsApp: 'Discuter sur WhatsApp',
  getStarted: 'Commencer →',
  copyright: 'Elorge Technologies Limited — Développement logiciel et infrastructure informatique',
  linkFeatures: 'Fonctionnalités',
  linkSessionWrap: "Bilan de l'année",
  linkCbt: 'Épreuves sur ordinateur',
  linkFinance: 'Frais, inventaire et comptabilité',
  linkLessonNotes: 'Notes de cours',
  linkCheckResult: 'Vérifier un résultat',
  linkOffline: 'Hors ligne',
  linkAbout: 'À propos',
  linkCareers: 'Carrières',
  linkContact: 'Contact',
  linkTerms: "Conditions d'utilisation",
  linkPrivacy: 'Politique de confidentialité',
};

const PT: SiteFooterLabels = {
  tagline: "Gestão escolar criada para escolas em África e além — registos, resultados e finanças que funcionam mesmo quando a internet falha.",
  productHeading: 'Produto',
  companyHeading: 'Empresa',
  getInTouchHeading: 'Fale connosco',
  chatOnWhatsApp: 'Conversar no WhatsApp',
  getStarted: 'Começar →',
  copyright: 'Elorge Technologies Limited — Desenvolvimento de Software e Infraestrutura de TI',
  linkFeatures: 'Funcionalidades',
  linkSessionWrap: 'Resumo do Ano Letivo',
  linkCbt: 'Provas por Computador',
  linkFinance: 'Propinas, Inventário e Contabilidade',
  linkLessonNotes: 'Planos de Aula',
  linkCheckResult: 'Consultar um Resultado',
  linkOffline: 'Funciona Offline',
  linkAbout: 'Sobre Nós',
  linkCareers: 'Carreiras',
  linkContact: 'Contacto',
  linkTerms: 'Termos de Serviço',
  linkPrivacy: 'Política de Privacidade',
};

const SITE_FOOTER_LABELS_BY_LOCALE: Record<SupportedLocale, SiteFooterLabels> = { en: EN, fr: FR, pt: PT };

export function siteFooterLabelsFor(locale: string): SiteFooterLabels {
  return SITE_FOOTER_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SITE_FOOTER_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
