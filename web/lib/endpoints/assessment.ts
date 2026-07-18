// web/lib/endpoints/assessment.ts
import { apiFetch } from '../api';

export interface AssessmentWeight {
  id: string;
  classId: string;
  subject: string | null;
  componentName: string;
  weightPercent: number;
}

export function getWeights(school: string, classId: string, subject?: string): Promise<AssessmentWeight[]> {
  const qs = subject ? `&subject=${encodeURIComponent(subject)}` : '';
  return apiFetch(`/${school}/assessment-weights?classId=${classId}${qs}`);
}

export function setWeights(school: string, classId: string, subject: string | undefined, components: { componentName: string; weightPercent: number }[]) {
  return apiFetch(`/${school}/assessment-weights`, { method: 'POST', body: JSON.stringify({ classId, subject, components }) });
}

export function listComponentScores(school: string, studentId: string, termId: string, subject: string) {
  return apiFetch<{ componentName: string; score: number }[]>(`/${school}/students/${studentId}/assessment-components?termId=${termId}&subject=${encodeURIComponent(subject)}`);
}

export function recordComponentScore(school: string, studentId: string, termId: string, subject: string, componentName: string, score: number) {
  return apiFetch(`/${school}/students/${studentId}/assessment-components`, {
    method: 'POST',
    body: JSON.stringify({ termId, subject, componentName, score }),
  });
}