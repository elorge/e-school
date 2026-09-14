// web/lib/locale.ts
// Mirrors backend/src/common/utils/locale.util.ts — keep in sync manually,
// same as currency.ts mirrors currency.util.ts.

export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PLATFORM_DEFAULT_LOCALE: SupportedLocale = 'en';

/** Display name for the language picker on signup and in school settings. */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
};

/**
 * One default language per supported country — only used to pre-select a
 * sensible option in the language dropdown when a country is chosen.
 * A school can always override it; this is a suggestion, not a lock-in.
 */
const LOCALE_BY_COUNTRY: Record<string, SupportedLocale> = {
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
  US: 'en',
  GB: 'en',
};

export function localeForCountry(countryCode: string): SupportedLocale {
  return LOCALE_BY_COUNTRY[countryCode] ?? PLATFORM_DEFAULT_LOCALE;
}
