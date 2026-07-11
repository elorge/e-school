// web/lib/endpoints/terms.ts
import { apiFetch } from '../api';
import type { Term } from '../types';

export function listTerms(school: string): Promise<Term[]> {
  return apiFetch(`/${school}/terms`);
}

export function createTerm(
  school: string,
  body: { name: string; academicSession: string; termNumber: number; startDate: string; endDate: string },
): Promise<Term> {
  return apiFetch(`/${school}/terms`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listSessions(school: string): Promise<string[]> {
  return apiFetch(`/${school}/terms/sessions`);
}