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

/**
 * Deliberately deterministic and rule-based, NOT AI-generated — this
 * touches a child's future, so every suggestion must be traceable back
 * to the specific subjects that produced it, and reproducible on
 * request. Subject names here must match what schools actually type
 * into subjectScores — keep this list growing as real usage reveals
 * naming variants (e.g. "Maths" vs "Mathematics").
 */
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

export const CBT_PRICE_PER_STUDENT_KOBO = Number(process.env.CBT_PRICE_PER_STUDENT_KOBO ?? 10_000);