// web/lib/endpoints/insights.ts
import { apiFetch, getToken } from '../api';

export interface SessionWrap {
  studentName: string;
  admissionId: string | null;
  academicSession: string;
  termsCovered: number;
  subjects: { subject: string; termScores: { termNumber: number; termName: string; score: number }[]; average: number }[];
  topStrengths: string[];
  suggestedFields: { field: string; supportingSubjects: string[] }[];
  narrative: string;
}

export function getSessionWrap(school: string, studentId: string, academicSession: string): Promise<SessionWrap> {
  return apiFetch(`/${school}/students/${studentId}/session-wrap?academicSession=${encodeURIComponent(academicSession)}`);
}

export async function fetchSessionWrapPdf(school: string, studentId: string, academicSession: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const token = getToken();
  const res = await fetch(
    `${API_URL}/${school}/students/${studentId}/session-wrap/pdf?academicSession=${encodeURIComponent(academicSession)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!res.ok) throw new Error(`Failed to fetch session wrap PDF: ${res.status}`);
  return res.blob();
}

/** Public — no auth token. The session shown is derived server-side from whichever term's PIN is currently active. */
export function publicSessionWrapLookup(school: string, admissionId: string, pin: string): Promise<SessionWrap> {
  return apiFetch(`/${school}/session-wrap/lookup`, {
    method: 'POST',
    body: JSON.stringify({ admissionId, pin }),
  });
}