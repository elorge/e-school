// web/lib/endpoints/lesson-notes.ts
import { apiFetch } from '../api';

export interface LessonNote {
  id: string;
  classId: string;
  termId: string;
  subject: string;
  topic: string;
  durationMinutes: number | null;
  objectives: string;
  instructionalMaterials: string | null;
  previousKnowledge: string | null;
  presentation: string;
  evaluation: string | null;
  assignment: string | null;
  summary: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  class?: { name: string };
}

export type LessonNoteInput = Omit<LessonNote, 'id' | 'status' | 'updatedAt' | 'class'>;

export function listForStaff(school: string, classId?: string, termId?: string): Promise<LessonNote[]> {
  const params = new URLSearchParams();
  if (classId) params.set('classId', classId);
  if (termId) params.set('termId', termId);
  const qs = params.toString();
  return apiFetch(`/${school}/lessons${qs ? `?${qs}` : ''}`);
}

export function getForStaff(school: string, id: string): Promise<LessonNote> {
  return apiFetch(`/${school}/lessons/${id}`);
}

export function createLessonNote(school: string, body: LessonNoteInput): Promise<LessonNote> {
  return apiFetch(`/${school}/lessons`, { method: 'POST', body: JSON.stringify(body) });
}

export function updateLessonNote(school: string, id: string, body: Partial<LessonNoteInput>): Promise<LessonNote> {
  return apiFetch(`/${school}/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function publishLessonNote(school: string, id: string): Promise<LessonNote> {
  return apiFetch(`/${school}/lessons/${id}/publish`, { method: 'POST' });
}

export function unpublishLessonNote(school: string, id: string): Promise<LessonNote> {
  return apiFetch(`/${school}/lessons/${id}/unpublish`, { method: 'POST' });
}

export function deleteLessonNote(school: string, id: string): Promise<void> {
  return apiFetch(`/${school}/lessons/${id}`, { method: 'DELETE' });
}

/** Public — gated by the student's own Admission ID, no login/PIN. */
export function listPublicLessonNotes(school: string, admissionId: string, subject?: string): Promise<LessonNote[]> {
  const params = new URLSearchParams({ admissionId });
  if (subject) params.set('subject', subject);
  return apiFetch(`/${school}/lessons/public/list?${params.toString()}`);
}

export function getPublicLessonNote(school: string, id: string, admissionId: string): Promise<LessonNote> {
  return apiFetch(`/${school}/lessons/public/${id}?admissionId=${encodeURIComponent(admissionId)}`);
}