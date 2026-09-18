// backend/src/common/utils/timezone.util.ts
/**
 * One IANA timezone per supported country — used as the DEFAULT when a
 * school is created without specifying its own (see CreateSchoolDto).
 * Stored explicitly on School.timezone at creation time rather than
 * looked up fresh on every check, same reasoning as School.currency:
 * self-describing, and immune to this map changing later.
 *
 * NOTE: a couple of these countries (notably US) span multiple
 * timezones — the value here is a reasonable default, not a claim that
 * every school in that country uses it. A school admin can override
 * School.timezone directly if the default doesn't match their campus.
 */
export const TIMEZONE_BY_COUNTRY: Record<string, string> = {
  NG: 'Africa/Lagos',
  GH: 'Africa/Accra',
  KE: 'Africa/Nairobi',
  ZA: 'Africa/Johannesburg',
  UG: 'Africa/Kampala',
  TZ: 'Africa/Dar_es_Salaam',
  RW: 'Africa/Kigali',
  CI: 'Africa/Abidjan',
  SN: 'Africa/Dakar',
  CM: 'Africa/Douala',
  MZ: 'Africa/Maputo',
  AO: 'Africa/Luanda',
  US: 'America/New_York', // spans multiple zones — override per-school if needed
  GB: 'Europe/London',
};

export const PLATFORM_DEFAULT_TIMEZONE = 'Africa/Lagos';

export function timezoneForCountry(countryCode: string): string {
  return TIMEZONE_BY_COUNTRY[countryCode] ?? PLATFORM_DEFAULT_TIMEZONE;
}

/**
 * Calendar day (YYYY-MM-DD) that `date` falls on IN `timezone` —
 * en-CA locale happens to format as YYYY-MM-DD natively, so no manual
 * string assembly needed. Uses the platform's built-in Intl support;
 * no timezone library dependency required.
 */
export function calendarDayInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}