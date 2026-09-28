// backend/src/common/utils/locale.util.ts
/**
 * Languages the platform actually has copy for — report card labels, CBT
 * UI strings, and system emails (see common/i18n/report-labels.ts and
 * modules/email/*). Adding a country to SUPPORTED_COUNTRIES (web/lib/
 * currency.ts) does NOT require adding a language here — it only needs
 * one of these if its usual business language isn't English.
 */
export const SUPPORTED_LOCALES = ['en', 'fr', 'pt', 'es'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PLATFORM_DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * One default language per supported country — used the same way
 * TIMEZONE_BY_COUNTRY is: as the DEFAULT when a school is created without
 * specifying `locale` explicitly (see CreateSchoolDto / CreateSignupRequestDto).
 * Stored explicitly on School.locale at creation time, not looked up fresh
 * on every render, so it survives this map changing later and a school
 * admin can always override it in settings regardless of what their
 * country's default is.
 *
 * Francophone West/Central African corridors map to 'fr', Lusophone
 * corridors (Mozambique, Angola) map to 'pt', Equatorial Guinea (the
 * only Spanish-speaking country in Africa) maps to 'es' — everywhere else on the
 * current Flutterwave-supported country list (SUPPORTED_COUNTRIES in
 * web/lib/currency.ts) conducts school business in English even where
 * other languages are also spoken locally.
 */
export const LOCALE_BY_COUNTRY: Record<string, SupportedLocale> = {
  NG: 'en',
  GH: 'en',
  KE: 'en',
  ZA: 'en',
  UG: 'en',
  TZ: 'en',
  RW: 'en',
  CI: 'fr',
  SN: 'fr',
  CM: 'fr',
  GQ: 'es',
  MZ: 'pt',
  AO: 'pt',
  US: 'en',
  GB: 'en',
};

export function localeForCountry(countryCode: string): SupportedLocale {
  return LOCALE_BY_COUNTRY[countryCode] ?? PLATFORM_DEFAULT_LOCALE;
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
