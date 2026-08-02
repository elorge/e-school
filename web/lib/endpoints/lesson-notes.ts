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
  materials: LessonMaterial[];
}

export type LessonMaterialType = 'IMAGE' | 'PDF_PAGE' | 'SLIDE';

export interface LessonMaterial {
  id: string;
  type: LessonMaterialType;
  url: string;
  order: number;
  insertAfter: string;
  originalFilename: string | null;
}

export type LessonNoteInput = Omit<LessonNote, 'id' | 'status' | 'updatedAt' | 'class' | 'materials'>;

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

export async function uploadMaterial(school: string, lessonId: string, file: File, insertAfter: string): Promise<LessonMaterial[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('insertAfter', insertAfter);
  const res = await fetch(`${API_URL}/${school}/lessons/${lessonId}/materials`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const body = await res.text();
    try {
      throw new Error(JSON.parse(body).message ?? 'Upload failed');
    } catch {
      throw new Error('Upload failed');
    }
  }
  return res.json();
}

export function reorderMaterials(school: string, lessonId: string, orderedIds: string[]): Promise<LessonMaterial[]> {
  return apiFetch(`/${school}/lessons/${lessonId}/materials/reorder`, { method: 'PATCH', body: JSON.stringify({ orderedIds }) });
}

export function deleteMaterial(school: string, lessonId: string, materialId: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/${school}/lessons/${lessonId}/materials/${materialId}`, { method: 'DELETE' });
}