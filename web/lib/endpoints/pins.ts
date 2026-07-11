// web/lib/endpoints/pins.ts
import { apiFetch } from '../api';

/** SCHOOL_ADMIN only — debits the wallet, generates PINs for each student. */
export function generatePins(
  school: string,
  body: { termId: string; studentIds: string[]; pricePerStudentKobo: number; idempotencyKey: string },
): Promise<{ studentId: string; plaintextPin: string }[]> {
  return apiFetch(`/${school}/pins/generate`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Public — no auth token needed, this is the student-facing result-lookup form. */
export function lookupResult(school: string, admissionId: string, pin: string) {
  return apiFetch(`/${school}/results/lookup`, {
    method: 'POST',
    body: JSON.stringify({ admissionId, pin }),
  });
}