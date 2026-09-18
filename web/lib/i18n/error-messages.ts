// web/lib/i18n/error-messages.ts
/**
 * Translates the machine-readable `code` a backend exception carries
 * (see backend/src/common/i18n/error-codes.ts) into a localized message.
 *
 * Only PUBLIC, unauthenticated flows get real error codes from the
 * backend — a parent or student hitting these can't pick a different
 * language, so these get proper translations. Everything else in the
 * app throws plain-string English exceptions with no code; `apiErrorMessage`
 * below falls back to the caller's own already-localized generic message
 * for those, rather than ever showing raw English text.
 */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';
import { ApiError } from '../api';

type MessageFn = (params?: Record<string, unknown>) => string;

const EN: Record<string, MessageFn> = {
  CBT_INVALID_ACCESS_CODE: () => 'Invalid or expired access code.',
  CBT_ADMISSION_ID_NOT_RECOGNIZED: () => 'Admission ID not recognized.',
  CBT_WRONG_DAY: (p) => `This test is scheduled for ${p?.date} — the access code only works on that day.`,
  CBT_TEST_NOT_OPEN: () => 'This test is not currently open.',
  CBT_NOT_ASSIGNED: () => 'This student is not assigned to this test.',
  CBT_ALREADY_SUBMITTED: () => 'This attempt has already been submitted.',
  PIN_TOO_MANY_ATTEMPTS: (p) => `Too many failed attempts. Try again after ${formatTime(String(p?.lockedUntil), 'en')}.`,
  PIN_INVALID_CREDENTIALS: () => 'Invalid Admission ID or PIN.',
  LESSON_NOTE_ADMISSION_ID_NOT_RECOGNIZED: () => 'Admission ID not recognized.',
  LESSON_NOTE_NOT_FOUND: () => "This lesson note isn't available to your class.",
  SIGNUP_WORKSPACE_NAME_TAKEN: () => 'That workspace name is already taken.',
  SIGNUP_SCHOOL_CODE_TAKEN: () => 'That school code is already taken.',
  LOGIN_INVALID_CREDENTIALS: () => 'Invalid credentials.',
  PASSWORD_RESET_LINK_INVALID: () => 'This password reset link is invalid or has expired.',
};

const FR: Record<string, MessageFn> = {
  CBT_INVALID_ACCESS_CODE: () => "Code d'accès invalide ou expiré.",
  CBT_ADMISSION_ID_NOT_RECOGNIZED: () => 'Matricule non reconnu.',
  CBT_WRONG_DAY: (p) => `Cette épreuve est prévue pour le ${p?.date} — le code d'accès ne fonctionne que ce jour-là.`,
  CBT_TEST_NOT_OPEN: () => "Cette épreuve n'est pas ouverte actuellement.",
  CBT_NOT_ASSIGNED: () => "Cet élève n'est pas assigné à cette épreuve.",
  CBT_ALREADY_SUBMITTED: () => 'Cette tentative a déjà été soumise.',
  PIN_TOO_MANY_ATTEMPTS: (p) => `Trop de tentatives échouées. Réessayez après ${formatTime(String(p?.lockedUntil), 'fr')}.`,
  PIN_INVALID_CREDENTIALS: () => 'Matricule ou code PIN invalide.',
  LESSON_NOTE_ADMISSION_ID_NOT_RECOGNIZED: () => 'Matricule non reconnu.',
  LESSON_NOTE_NOT_FOUND: () => "Cette note de cours n'est pas disponible pour votre classe.",
  SIGNUP_WORKSPACE_NAME_TAKEN: () => 'Ce nom d\'espace de travail est déjà pris.',
  SIGNUP_SCHOOL_CODE_TAKEN: () => "Ce code d'école est déjà pris.",
  LOGIN_INVALID_CREDENTIALS: () => 'Identifiants invalides.',
  PASSWORD_RESET_LINK_INVALID: () => 'Ce lien de réinitialisation est invalide ou a expiré.',
};

const PT: Record<string, MessageFn> = {
  CBT_INVALID_ACCESS_CODE: () => 'Código de acesso inválido ou expirado.',
  CBT_ADMISSION_ID_NOT_RECOGNIZED: () => 'Número de matrícula não reconhecido.',
  CBT_WRONG_DAY: (p) => `Esta prova está agendada para ${p?.date} — o código de acesso só funciona nesse dia.`,
  CBT_TEST_NOT_OPEN: () => 'Esta prova não está atualmente aberta.',
  CBT_NOT_ASSIGNED: () => 'Este aluno não está atribuído a esta prova.',
  CBT_ALREADY_SUBMITTED: () => 'Esta tentativa já foi submetida.',
  PIN_TOO_MANY_ATTEMPTS: (p) => `Demasiadas tentativas falhadas. Tente novamente após ${formatTime(String(p?.lockedUntil), 'pt')}.`,
  PIN_INVALID_CREDENTIALS: () => 'Número de matrícula ou PIN inválido.',
  LESSON_NOTE_ADMISSION_ID_NOT_RECOGNIZED: () => 'Número de matrícula não reconhecido.',
  LESSON_NOTE_NOT_FOUND: () => 'Esta nota de aula não está disponível para a sua turma.',
  SIGNUP_WORKSPACE_NAME_TAKEN: () => 'Esse nome de espaço de trabalho já está em uso.',
  SIGNUP_SCHOOL_CODE_TAKEN: () => 'Esse código de escola já está em uso.',
  LOGIN_INVALID_CREDENTIALS: () => 'Credenciais inválidas.',
  PASSWORD_RESET_LINK_INVALID: () => 'Este link de redefinição de palavra-passe é inválido ou expirou.',
};

function formatTime(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale);
  } catch {
    return iso;
  }
}

const ERROR_MESSAGES_BY_LOCALE: Record<SupportedLocale, Record<string, MessageFn>> = {
  en: EN,
  fr: FR,
  pt: PT,
};

/**
 * The one helper every catch block should use instead of `err.message`.
 * - Known code (a public-flow exception) → real localized translation.
 * - No code, or unrecognized code (an internal/admin-facing exception
 *   that was never given a code) → the caller's own already-localized
 *   generic fallback string, never the raw backend English.
 */
export function apiErrorMessage(err: unknown, locale: string, fallback: string): string {
  if (err instanceof ApiError && err.code) {
    const dict = ERROR_MESSAGES_BY_LOCALE[locale as SupportedLocale] ?? ERROR_MESSAGES_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
    const fn = dict[err.code];
    if (fn) return fn(err.params);
  }
  return fallback;
}
