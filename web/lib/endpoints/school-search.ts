// web/lib/endpoints/school-search.ts
import { apiFetch } from '../api';
import type { School } from '../types';

export async function searchSchools(q: string): Promise<School[]> {
  const result = await apiFetch<School[]>(`/schools/search?q=${encodeURIComponent(q)}`);
  return result ?? [];
}