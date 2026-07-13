// web/lib/endpoints/cbt.ts
import { apiFetch } from '../api';

export interface CbtTest {
  id: string;
  title: string;
  subject: string;
  termId: string;
  classId: string;
  durationMinutes: number;
  objectiveMaxScore: number;
  theoryMaxScore: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

export function listTests(school: string): Promise<CbtTest[]> {
  return apiFetch(`/${school}/cbt/tests`);
}

export function getTest(school: string, testId: string): Promise<CbtTest & { questions: unknown[] }> {
  return apiFetch(`/${school}/cbt/tests/${testId}`);
}

export function createTest(
  school: string,
  body: {
    termId: string;
    classId: string;
    subject: string;
    title: string;
    durationMinutes: number;
    theoryMaxScore: number;
    scheduledDate: string;
    accessWindowMinutes?: number;
  },
): Promise<CbtTest> {
  return apiFetch(`/${school}/cbt/tests`, { method: 'POST', body: JSON.stringify(body) });
}

export interface AttemptSession {
  attemptId: string;
  deadlineAt: string;
  questions: { id: string; questionText: string; options: string[]; points: number }[];
  savedAnswers: Record<string, number>;
}

export async function downloadQuestionTemplate(school: string, testId: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/cbt/tests/${testId}/questions/template`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
  return res.blob();
}

export async function bulkUploadQuestions(
  school: string,
  testId: string,
  file: File,
): Promise<{ addedCount: number; errors: { row: number; reason: string }[] }> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/${school}/cbt/tests/${testId}/questions/bulk-upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export function addQuestion(
  school: string,
  testId: string,
  body: { questionText: string; options: string[]; correctOptionIndex: number; points: number },
) {
  return apiFetch(`/${school}/cbt/tests/${testId}/questions`, { method: 'POST', body: JSON.stringify(body) });
}

export function publishTest(school: string, testId: string, studentIds?: string[]) {
  return apiFetch(`/${school}/cbt/tests/${testId}/publish`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), studentIds }),
  });
}

export function listAttempts(school: string, testId: string) {
  return apiFetch(`/${school}/cbt/tests/${testId}/attempts`);
}

export function startAttempt(school: string, testId: string, studentId: string): Promise<AttemptSession> {
  return apiFetch(`/${school}/cbt/tests/${testId}/attempts/start`, { method: 'POST', body: JSON.stringify({ studentId }) });
}

export function saveAnswer(school: string, attemptId: string, questionId: string, selectedOptionIndex: number) {
  return apiFetch(`/${school}/cbt/tests/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedOptionIndex }),
  });
}

export function submitAttempt(school: string, attemptId: string) {
  return apiFetch(`/${school}/cbt/tests/attempts/${attemptId}/submit`, { method: 'POST' });
}

/** Public — student self-service, no staff login involved. */
export function studentLogin(school: string, accessCode: string, admissionId: string): Promise<AttemptSession> {
  return apiFetch(`/${school}/cbt/tests/student-login`, { method: 'POST', body: JSON.stringify({ accessCode, admissionId }) });
}

export function gradeTheory(school: string, attemptId: string, theoryScore: number) {
  return apiFetch(`/${school}/cbt/tests/attempts/${attemptId}/theory-score`, {
    method: 'POST',
    body: JSON.stringify({ theoryScore }),
  });
}