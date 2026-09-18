// web/lib/i18n/promotion-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface PromotionLabels {
  pageTitle: string;
  fromClass: string;
  toClass: string;
  chooseTargetError: string;
  promotedNotice: (count: number) => string;
  couldNotPromote: string;
  promoteBtn: (count: number) => string;
}

const EN: PromotionLabels = {
  pageTitle: 'End-of-Session Promotion',
  fromClass: 'From class',
  toClass: 'To class',
  chooseTargetError: 'Choose a target class and at least one student.',
  promotedNotice: (count) => `Promoted ${count} student(s).`,
  couldNotPromote: 'Could not promote students',
  promoteBtn: (count) => `Promote ${count} student(s)`,
};

const FR: PromotionLabels = {
  pageTitle: "Promotion de fin d'année",
  fromClass: 'Classe de départ',
  toClass: "Classe d'arrivée",
  chooseTargetError: 'Choisissez une classe cible et au moins un élève.',
  promotedNotice: (count) => `${count} élève(s) promu(s).`,
  couldNotPromote: 'Impossible de promouvoir les élèves',
  promoteBtn: (count) => `Promouvoir ${count} élève(s)`,
};

const PROMOTION_LABELS_BY_LOCALE: Record<SupportedLocale, PromotionLabels> = {
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

export function promotionLabelsFor(locale: string): PromotionLabels {
  return PROMOTION_LABELS_BY_LOCALE[locale as SupportedLocale] ?? PROMOTION_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
