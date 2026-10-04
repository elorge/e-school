// backend/src/common/constants.ts
export const PLATFORM_DEFAULT_PRICE_PER_STUDENT_KOBO = Number(
  process.env.DEFAULT_PRICE_PER_STUDENT_KOBO ?? 20_000,
);

// FIX: was hardcoded to 10_000_000 in two separate places (WalletService's
// default param, and here implicitly). Now single-sourced from env, with
// the schema above enforcing a valid default.
export const WELCOME_BONUS_KOBO = Number(process.env.WELCOME_BONUS_KOBO ?? 10_000_000);

// FIX: PinsService imported this as a hardcoded const of 5 in one file and
// as a hardcoded module-level const MAX_FAILED_ATTEMPTS = 5 in another —
// now genuinely configurable and defined once.
export const MAX_PIN_LOOKUP_ATTEMPTS = Number(process.env.MAX_PIN_LOOKUP_ATTEMPTS ?? 5);

export const LOW_BALANCE_WARNING_THRESHOLD_KOBO = Number(
  process.env.LOW_BALANCE_WARNING_THRESHOLD_KOBO ?? 500_000,
);

export const BANK_TRANSFER_SLA_HOURS = Number(process.env.BANK_TRANSFER_SLA_HOURS ?? 24);

// A scanning device's clock can be honestly wrong, or a scan can be
// deliberately backdated by a malicious actor. Clamp accepted occurredAt
// values to a sane window instead of trusting the client blindly.
export const ATTENDANCE_MAX_BACKDATE_HOURS = Number(process.env.ATTENDANCE_MAX_BACKDATE_HOURS ?? 72);
export const ATTENDANCE_MAX_FUTURE_MINUTES = Number(process.env.ATTENDANCE_MAX_FUTURE_MINUTES ?? 5);

// Report card performance classification (spec: fixed thresholds, not
// class- or self-relative). Override per-deployment via env if a school
// uses a different grading scale.
export const PERFORMANCE_STRENGTH_THRESHOLD = Number(process.env.PERFORMANCE_STRENGTH_THRESHOLD ?? 70);
export const PERFORMANCE_AT_RISK_THRESHOLD = Number(process.env.PERFORMANCE_AT_RISK_THRESHOLD ?? 50);
// Between AT_RISK and STRENGTH thresholds = "Needs Improvement".

// NEW: platform-wide defaults used only where a country/currency isn't
// otherwise known — e.g. PlatformFinanceService.recordExpense falling
// back for an Elorge-internal expense that didn't specify a currency.
// Individual schools ALWAYS carry their own explicit countryCode/currency
// (see CreateSchoolDto) — these are never used as a silent per-school
// default.
export const PLATFORM_DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY ?? 'NGN';
export const PLATFORM_DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE ?? 'NG';

/**
 * SEED DATA ONLY — no longer read directly by InsightsService. This is
 * the Nigeria-curriculum-flavored starting set, inserted as global
 * (schoolId: null) rows into SubjectCareerField by the seed script (see
 * seedGlobalCareerFields in prisma/seed.ts). At runtime,
 * CareerFieldsService merges these global defaults with whatever a
 * school added on top for its own curriculum — see
 * career-fields.service.ts and schema-changes-career-fields.prisma.
 *
 * Deliberately deterministic and rule-based, NOT AI-generated — this
 * touches a child's future, so every suggestion must be traceable back
 * to the specific subjects that produced it, and reproducible on
 * request. Subject names here must match what schools actually type
 * into subjectScores — keep this list growing as real usage reveals
 * naming variants (e.g. "Maths" vs "Mathematics").
 */
// Every school starts with this standard set of LeaveType rows (see
// LeaveService.seedDefaultTypes) so the leave module isn't an empty
// shell on day one. A school can rename/add/remove types afterwards —
// this is just a sensible starting point, not a fixed list.
export const DEFAULT_LEAVE_TYPES: { name: string; defaultDaysPerYear: number }[] = [
  { name: 'Annual Leave', defaultDaysPerYear: 21 },
  { name: 'Sick Leave', defaultDaysPerYear: 10 },
  { name: 'Compassionate Leave', defaultDaysPerYear: 5 },
  { name: 'Maternity Leave', defaultDaysPerYear: 90 },
  { name: 'Paternity Leave', defaultDaysPerYear: 5 },
  { name: 'Study Leave', defaultDaysPerYear: 10 },
  // 0 = no yearly cap (the balance check only applies to types with an allowance above 0).
  { name: 'Unpaid Leave', defaultDaysPerYear: 0 },
];

export const SUBJECT_CAREER_FIELDS: Record<string, string[]> = {
  Mathematics: ['Engineering', 'Computer Science', 'Data Science', 'Actuarial Science'],
  'Further Mathematics': ['Engineering', 'Computer Science', 'Data Science'],
  Physics: ['Engineering', 'Computer Science', 'Architecture'],
  Chemistry: ['Medicine', 'Pharmacy', 'Chemical Engineering', 'Biotechnology'],
  Biology: ['Medicine', 'Pharmacy', 'Nursing', 'Biotechnology'],
  'Agricultural Science': ['Agriculture', 'Agribusiness', 'Veterinary Medicine'],
  English: ['Law', 'Journalism', 'Communications', 'Public Relations'],
  'English Language': ['Law', 'Journalism', 'Communications', 'Public Relations'],
  Literature: ['Law', 'Journalism', 'Creative Writing'],
  'Literature in English': ['Law', 'Journalism', 'Creative Writing'],
  Economics: ['Economics', 'Finance', 'Business Administration'],
  Commerce: ['Business Administration', 'Accounting', 'Entrepreneurship'],
  Accounting: ['Accounting', 'Finance', 'Business Administration'],
  Government: ['Public Administration', 'International Relations', 'Law', 'Political Science'],
  History: ['International Relations', 'Public Administration', 'Diplomacy'],
  Geography: ['Urban Planning', 'Environmental Science', 'Geology'],
  'Fine Art': ['Design', 'Architecture', 'Creative Arts'],
  Music: ['Creative Arts', 'Music Production'],
  'Computer Studies': ['Computer Science', 'Software Engineering', 'Data Science'],
  'Christian Religious Studies': ['Theology', 'Public Administration', 'Law'],
  'Islamic Religious Studies': ['Theology', 'Public Administration', 'Law'],
};