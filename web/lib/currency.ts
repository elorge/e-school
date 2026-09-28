// web/lib/currency.ts
// Mirrors backend/src/common/utils/currency.util.ts — keep in sync manually.

const ZERO_DECIMAL_CURRENCIES = new Set(['XOF', 'XAF', 'JPY', 'KRW', 'UGX', 'RWF']);
const THREE_DECIMAL_CURRENCIES = new Set(['KWD', 'BHD', 'OMR']);

export function decimalPlacesFor(currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(currency)) return 3;
  return 2;
}

export function minorToMajor(amountMinor: number, currency: string): number {
  const decimals = decimalPlacesFor(currency);
  return Math.round(amountMinor) / 10 ** decimals;
}

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

/** formatMoney(1200000, 'NGN') -> "₦12,000.00". Use this everywhere a page used to hardcode ₦ and /100. */
export function formatMoney(amountMinor: number, currency: string, locale = 'en'): string {
  const major = minorToMajor(amountMinor, currency);
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const decimals = decimalPlacesFor(currency);
  return `${symbol}${major.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export const SUPPORTED_CURRENCIES = [
  'NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'XOF', 'XAF', 'RWF', 'MZN', 'AOA', 'USD', 'GBP', 'EUR',
] as const;

export interface CountryOption {
  code: string;
  name: string;
  currency: string;
}

/** Backs the country picker on signup/school-creation forms — selecting a country auto-fills its currency (see currencyForCountry). Expand as you enable more corridors in Flutterwave. */
export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'KE', name: 'Kenya', currency: 'KES' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'UG', name: 'Uganda', currency: 'UGX' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF' },
  { code: 'SN', name: 'Senegal', currency: 'XOF' },
  { code: 'CM', name: 'Cameroon', currency: 'XAF' },
  { code: 'GQ', name: 'Equatorial Guinea', currency: 'XAF' },
  { code: 'MZ', name: 'Mozambique', currency: 'MZN' },
  { code: 'AO', name: 'Angola', currency: 'AOA' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
];

export function currencyForCountry(countryCode: string): string | null {
  return SUPPORTED_COUNTRIES.find((c) => c.code === countryCode)?.currency ?? null;
}