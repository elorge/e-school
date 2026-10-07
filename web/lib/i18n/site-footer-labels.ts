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
  linkPricing: string;
  linkDemo: string;
  linkIdCards: string;
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
  chatOnWhatsApp: 'Chat with us live',
  getStarted: 'Get started →',
  copyright: 'Elorge Technologies Limited — Software Development & IT Infrastructure',
  linkFeatures: 'Features',
  linkSessionWrap: 'Session Wrap',
  linkCbt: 'Computer-Based Testing',
  linkFinance: 'Fees, Inventory & Accounting',
  linkLessonNotes: 'Lesson Notes',
  linkCheckResult: 'Check a Result',
  linkPricing: 'Pricing',
  linkDemo: 'Book a Demo',
  linkIdCards: 'ID Cards & Attendance',
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
  chatOnWhatsApp: 'Discuter en direct',
  getStarted: 'Commencer →',
  copyright: 'Elorge Technologies Limited — Développement logiciel et infrastructure informatique',
  linkFeatures: 'Fonctionnalités',
  linkSessionWrap: "Bilan de l'année",
  linkCbt: 'Épreuves sur ordinateur',
  linkFinance: 'Frais, inventaire et comptabilité',
  linkLessonNotes: 'Notes de cours',
  linkCheckResult: 'Vérifier un résultat',
  linkPricing: 'Tarifs',
  linkDemo: 'Réserver une démo',
  linkIdCards: "Cartes d'identité et présence",
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
  chatOnWhatsApp: 'Conversar ao vivo',
  getStarted: 'Começar →',
  copyright: 'Elorge Technologies Limited — Desenvolvimento de Software e Infraestrutura de TI',
  linkFeatures: 'Funcionalidades',
  linkSessionWrap: 'Resumo do Ano Letivo',
  linkCbt: 'Provas por Computador',
  linkFinance: 'Propinas, Inventário e Contabilidade',
  linkLessonNotes: 'Planos de Aula',
  linkCheckResult: 'Consultar um Resultado',
  linkPricing: 'Preços',
  linkDemo: 'Agendar demonstração',
  linkIdCards: 'Cartões de Identificação e Presença',
  linkOffline: 'Funciona Offline',
  linkAbout: 'Sobre Nós',
  linkCareers: 'Carreiras',
  linkContact: 'Contacto',
  linkTerms: 'Termos de Serviço',
  linkPrivacy: 'Política de Privacidade',
};

const ES: SiteFooterLabels = {
  tagline: 'Gestión escolar diseñada para colegios en África y más allá: registros, resultados y finanzas que funcionan incluso cuando internet no.',
  productHeading: 'Producto',
  companyHeading: 'Empresa',
  getInTouchHeading: 'Contáctenos',
  chatOnWhatsApp: 'Chatear en vivo',
  getStarted: 'Comenzar →',
  copyright: 'Elorge Technologies Limited — Desarrollo de Software e Infraestructura de TI',
  linkFeatures: 'Funciones',
  linkSessionWrap: 'Resumen del Año Escolar',
  linkCbt: 'Exámenes por Computadora',
  linkFinance: 'Cuotas, Inventario y Contabilidad',
  linkLessonNotes: 'Notas de Clase',
  linkCheckResult: 'Consultar un Resultado',
  linkPricing: 'Precios',
  linkDemo: 'Reservar demostración',
  linkIdCards: 'Tarjetas de Identificación y Asistencia',
  linkOffline: 'Funciona sin conexión',
  linkAbout: 'Nosotros',
  linkCareers: 'Empleo',
  linkContact: 'Contacto',
  linkTerms: 'Términos de Servicio',
  linkPrivacy: 'Política de Privacidad',
};

const SITE_FOOTER_LABELS_BY_LOCALE: Record<SupportedLocale, SiteFooterLabels> = { en: EN, fr: FR, pt: PT, es: ES };

export function siteFooterLabelsFor(locale: string): SiteFooterLabels {
  return SITE_FOOTER_LABELS_BY_LOCALE[locale as SupportedLocale] ?? SITE_FOOTER_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
