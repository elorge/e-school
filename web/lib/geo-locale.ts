// web/lib/geo-locale.ts
import { SupportedLocale } from './locale';

/**
 * ISO 3166-1 alpha-2 country code → the language actually spoken there,
 * for auto-selecting the MARKETING site's language from a visitor's IP
 * country (see middleware.ts). This is deliberately a much bigger list
 * than lib/locale.ts's LOCALE_BY_COUNTRY, which only covers countries
 * the platform currently bills schools in — a marketing visitor can
 * browse in from anywhere, whether or not their country can sign up a
 * school yet.
 *
 * Only includes a country where French/Portuguese/Spanish is genuinely
 * the (or an) official language, per that country's constitution —
 * deliberately excludes countries where the language is only widely
 * used in business/education without official status (e.g. the Maghreb,
 * where Arabic is the sole official language despite French's everyday
 * use). English-speaking-majority countries are left out entirely: they
 * fall through to the English default, same as any unlisted country.
 *
 * Canada is deliberately omitted despite French being co-official —
 * country-level geolocation can't distinguish Québec from the
 * anglophone majority elsewhere in the country, and guessing wrong for
 * most Canadian visitors is worse than just defaulting to English.
 */
export const MARKETING_LOCALE_BY_COUNTRY: Record<string, SupportedLocale> = {
  // French
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  LU: 'fr',
  MC: 'fr',
  SN: 'fr',
  CI: 'fr',
  ML: 'fr',
  BF: 'fr',
  NE: 'fr',
  TG: 'fr',
  BJ: 'fr',
  GA: 'fr',
  CG: 'fr',
  CD: 'fr',
  CM: 'fr',
  TD: 'fr',
  CF: 'fr',
  GN: 'fr',
  MG: 'fr',
  RW: 'fr',
  BI: 'fr',
  DJ: 'fr',
  KM: 'fr',
  HT: 'fr',
  VU: 'fr',

  // Portuguese
  PT: 'pt',
  BR: 'pt',
  AO: 'pt',
  MZ: 'pt',
  GW: 'pt',
  CV: 'pt',
  ST: 'pt',
  TL: 'pt',

  // Spanish
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  PE: 'es',
  VE: 'es',
  CL: 'es',
  EC: 'es',
  GT: 'es',
  CU: 'es',
  BO: 'es',
  DO: 'es',
  HN: 'es',
  PY: 'es',
  SV: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  UY: 'es',
  PR: 'es',
  GQ: 'es', // Equatorial Guinea — trilingual (Spanish/French/Portuguese), Spanish is the dominant one
};

export function marketingLocaleForCountry(countryCode: string | null | undefined): SupportedLocale | null {
  if (!countryCode) return null;
  return MARKETING_LOCALE_BY_COUNTRY[countryCode.toUpperCase()] ?? null;
}
