// web/lib/endpoints/career-fields.ts
import { apiFetch } from '../api';

export interface CareerFieldMapping {
  id: string;
  schoolId: string | null; // null = global default, not deletable from here
  subject: string;
  field: string;
}

/** Global defaults + this school's own custom mappings, merged. */
export function listCareerFields(school: string): Promise<CareerFieldMapping[]> {
  return apiFetch(`/${school}/career-fields`);
}

/** SCHOOL_ADMIN only — adds a mapping for a subject this school teaches that the global defaults don't cover (e.g. "Kiswahili" -> "Linguistics"). */
export function addCareerFieldMapping(school: string, subject: string, field: string): Promise<CareerFieldMapping> {
  return apiFetch(`/${school}/career-fields`, { method: 'POST', body: JSON.stringify({ subject, field }) });
}

/** SCHOOL_ADMIN only — only ever removes this school's own custom rows; global defaults aren't touchable here. */
export function removeCareerFieldMapping(school: string, id: string): Promise<{ removed: boolean }> {
  return apiFetch(`/${school}/career-fields/${id}`, { method: 'DELETE' });
}