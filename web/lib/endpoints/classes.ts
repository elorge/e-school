// web/lib/endpoints/classes.ts
import { apiFetch } from '../api';
import type { Class } from '../types';

export function listClasses(school: string): Promise<Class[]> {
  return apiFetch(`/${school}/classes`);
}

export function createClass(school: string, name: string, classTeacherId?: string): Promise<Class> {
  return apiFetch(`/${school}/classes`, {
    method: 'POST',
    body: JSON.stringify({ name, classTeacherId }),
  });
}

export function assignClassTeacher(school: string, classId: string, classTeacherId: string) {
  return apiFetch(`/${school}/classes/${classId}/assign-teacher`, {
    method: 'PATCH',
    body: JSON.stringify({ classTeacherId }),
  });
}