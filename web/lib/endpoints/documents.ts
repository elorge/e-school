// web/lib/endpoints/documents.ts
import { getToken, apiFetch } from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchPdfBlob(path: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);
  return res.blob();
}

export function fetchReportCardPdf(school: string, studentId: string, termId: string) {
  return fetchPdfBlob(`/${school}/students/${studentId}/results/${termId}/pdf`);
}

export function fetchIdCardPdf(school: string, studentId: string) {
  return fetchPdfBlob(`/${school}/students/${studentId}/id-card/pdf`);
}

export function issueIdCard(school: string, studentId: string) {
  return apiFetch(`/${school}/students/${studentId}/id-card/issue`, { method: 'POST' });
}

export function fetchCalendarPdf(school: string, termId: string) {
  return fetchPdfBlob(`/${school}/calendar/pdf?termId=${termId}`);
}

export function fetchTestPaperPdf(school: string, testId: string) {
  return fetchPdfBlob(`/${school}/cbt/tests/${testId}/paper/pdf`);
}

/** Opens a PDF Blob in a new tab for preview/printing. */
export function openPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}