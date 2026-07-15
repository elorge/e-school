// web/lib/endpoints/school-search.ts
import { apiFetch } from '../api';
import type { School } from '../types';

export function searchSchools(q: string): Promise<School[]> {
  return apiFetch(`/schools/search?q=${encodeURIComponent(q)}`);
}