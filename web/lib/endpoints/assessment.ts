// web/lib/endpoints/assessment.ts
import { apiFetch } from '../api';

export interface AssessmentWeight {
  id: string;
  classId: string;
  termId: string | null;
  subject: string | null;
  componentName: string;
  weightPercent: number;
}

export type WeightResolutionLevel = 'term-subject' | 'subject-default' | 'term-classwide' | 'class-default' | 'unweighted';

export interface AssessmentWeightCoverageRow {
  termId: string;
  termName: string;
  level: WeightResolutionLevel;
}

export function getWeights(school: string, classId: string, subject?: string, termId?: string): Promise<AssessmentWeight[]> {
  const params = new URLSearchParams({ classId });
  if (subject) params.set('subject', subject);
  if (termId) params.set('termId', termId);
  return apiFetch(`/${school}/assessment-weights?${params.toString()}`);
}

export function getCoverage(school: string, classId: string, subject?: string): Promise<AssessmentWeightCoverageRow[]> {
  const params = new URLSearchParams({ classId });
  if (subject) params.set('subject', subject);
  return apiFetch(`/${school}/assessment-weights/coverage?${params.toString()}`);
}

export function setWeights(
  school: string,
  classId: string,
  subject: string | undefined,
  termId: string | undefined,
  components: { componentName: string; weightPercent: number }[],
) {
  return apiFetch(`/${school}/assessment-weights`, { method: 'POST', body: JSON.stringify({ classId, subject, termId, components }) });
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