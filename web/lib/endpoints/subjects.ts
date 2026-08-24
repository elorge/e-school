// web/lib/endpoints/subjects.ts
import { apiFetch } from '../api';

export interface Subject {
  id: string;
  name: string;
}

export interface ClassSubject {
  id: string;
  subject: Subject;
}

/** School-wide catalog — already fully school-scoped on the backend, so a school anywhere adds whatever their curriculum uses (e.g. "Kiswahili", "Twi"). Everyone at the school can read it; only SCHOOL_ADMIN edits it. */
export function listCatalog(school: string): Promise<Subject[]> {
  return apiFetch(`/${school}/subjects`);
}

export function createInCatalog(school: string, name: string): Promise<Subject> {
  return apiFetch(`/${school}/subjects`, { method: 'POST', body: JSON.stringify({ name }) });
}

export function removeFromCatalog(school: string, subjectId: string) {
  return apiFetch(`/${school}/subjects/${subjectId}`, { method: 'DELETE' });
}

export function listForClass(school: string, classId: string): Promise<ClassSubject[]> {
  return apiFetch(`/${school}/classes/${classId}/subjects`);
}

export function assignToClass(school: string, classId: string, subjectId: string) {
  return apiFetch(`/${school}/classes/${classId}/subjects`, { method: 'POST', body: JSON.stringify({ subjectId }) });
}

export function removeFromClass(school: string, classId: string, subjectId: string) {
  return apiFetch(`/${school}/classes/${classId}/subjects/${subjectId}`, { method: 'DELETE' });
}