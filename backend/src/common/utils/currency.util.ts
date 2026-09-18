// backend/src/common/utils/currency.util.ts
/**
 * Every money field in the database (amountKobo, totalKobo, paidKobo,
 * pricePerStudentKoboOverride, etc.) is an integer in the currency's
 * "minor unit" — the same pattern that used to be implicitly "always
 * kobo". The field names weren't renamed (that would touch dozens of
 * files for no functional benefit) — they now just mean "minor unit of
 * whichever currency this row belongs to". This file is what makes that
 * genuinely currency-agnostic instead of silently NGN-only.
 *
 * NEVER assume 2 decimal places / divide-by-100 directly in a service.
 * Always go through decimalPlacesFor / minorToMajor / majorToMinor.
 */

const ZERO_DECIMAL_CURRENCIES = new Set(['XOF', 'XAF', 'JPY', 'KRW', 'UGX', 'RWF']);
const THREE_DECIMAL_CURRENCIES = new Set(['KWD', 'BHD', 'OMR']);

export function decimalPlacesFor(currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(currency)) return 3;
  return 2;
}

/** Minor units (kobo, cents, pesewas...) -> major units (Naira, Dollars, Cedis...). */
export function minorToMajor(amountMinor: number, currency: string): number {
  const decimals = decimalPlacesFor(currency);
  return Math.round(amountMinor) / 10 ** decimals;
}

/** Major units -> minor units. Use when parsing an amount a gateway reports in major units (e.g. Flutterwave webhook payloads). */
export function majorToMinor(amountMajor: number, currency: string): number {
  const decimals = decimalPlacesFor(currency);
  return Math.round(amountMajor * 10 ** decimals);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  USD: '$',
  GBP: '£',
  EUR: '€',
  UGX: 'USh',
  TZS: 'TSh',
  XOF: 'CFA',
  XAF: 'FCFA',
  RWF: 'RF',
  MZN: 'MT',
  AOA: 'Kz',
};

/** Formats a minor-unit amount for display — e.g. formatMoney(1200000, 'NGN') -> "₦12,000.00". Used by email templates and anywhere else money is shown to a human. */
export function formatMoney(amountMinor: number, currency: string, locale = 'en'): string {
  const major = minorToMajor(amountMinor, currency);
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const decimals = decimalPlacesFor(currency);
  const formatted = major.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

/**
 * Currencies this platform accepts for a school's wallet — i.e. what
 * Flutterwave can actually settle for you. Expand as you enable more
 * corridors in your Flutterwave dashboard. Validated at school
 * signup/creation time so a school can never end up with a currency
 * nothing downstream knows how to charge.
 */
export const SUPPORTED_CURRENCIES = [
  'NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'XOF', 'XAF', 'RWF', 'MZN', 'AOA', 'USD', 'GBP', 'EUR',
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Countries where Flutterwave's direct-bank-transfer / dedicated virtual
 * account rail (LedgerSource.DVA) is live. Controls whether that funding
 * option appears in a school's wallet UI — everywhere else, schools fund
 * via card/mobile-money checkout through PaymentsService.initialize.
 * Expand this set as you turn on DVA for more countries in Flutterwave.
 */
export const DVA_SUPPORTED_COUNTRIES = new Set(['NG']);