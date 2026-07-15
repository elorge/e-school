// web/lib/endpoints/pin-generation.ts
import { apiFetch } from '../api';

export function getPricing(school: string): Promise<{ pricePerStudentKobo: number }> {
  return apiFetch(`/${school}/wallet/pricing`);
}

export function generatePins(
  school: string,
  body: { termId: string; studentIds: string[]; pricePerStudentKobo: number; idempotencyKey: string },
): Promise<{ studentId: string; plaintextPin: string }[]> {
  return apiFetch(`/${school}/pins/generate`, { method: 'POST', body: JSON.stringify(body) });
}