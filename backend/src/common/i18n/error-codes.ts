// backend/src/common/i18n/error-codes.ts
/**
 * Codes for exceptions thrown on PUBLIC, unauthenticated flows — a
 * parent or student hitting these has no way to pick a different
 * language than whatever the school configured, so these get proper
 * locale-aware messages on the frontend (see web/lib/i18n/error-messages.ts).
 *
 * Everything else in the app throws plain-string exceptions as before —
 * staff/admin users are already inside a school-language UI and a
 * generic localized fallback message (already wired into every catch
 * block on the frontend) is enough; giving every internal exception in
 * the codebase its own translated copy is not attempted here.
 */
export const ERROR_CODES = {
  CBT_INVALID_ACCESS_CODE: 'CBT_INVALID_ACCESS_CODE',
  CBT_ADMISSION_ID_NOT_RECOGNIZED: 'CBT_ADMISSION_ID_NOT_RECOGNIZED',
  CBT_WRONG_DAY: 'CBT_WRONG_DAY',
  CBT_TEST_NOT_OPEN: 'CBT_TEST_NOT_OPEN',
  CBT_NOT_ASSIGNED: 'CBT_NOT_ASSIGNED',
  CBT_ALREADY_SUBMITTED: 'CBT_ALREADY_SUBMITTED',
  PIN_TOO_MANY_ATTEMPTS: 'PIN_TOO_MANY_ATTEMPTS',
  PIN_INVALID_CREDENTIALS: 'PIN_INVALID_CREDENTIALS',
  LESSON_NOTE_ADMISSION_ID_NOT_RECOGNIZED: 'LESSON_NOTE_ADMISSION_ID_NOT_RECOGNIZED',
  LESSON_NOTE_NOT_FOUND: 'LESSON_NOTE_NOT_FOUND',
  SIGNUP_WORKSPACE_NAME_TAKEN: 'SIGNUP_WORKSPACE_NAME_TAKEN',
  SIGNUP_SCHOOL_CODE_TAKEN: 'SIGNUP_SCHOOL_CODE_TAKEN',
  LOGIN_INVALID_CREDENTIALS: 'LOGIN_INVALID_CREDENTIALS',
  PASSWORD_RESET_LINK_INVALID: 'PASSWORD_RESET_LINK_INVALID',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
