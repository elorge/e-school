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
  scheduledDate: string;
  accessCode: string | null;
  countsTowardReport: boolean;
  componentName: string;
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
    countsTowardReport?: boolean;
    componentName?: string;
  },
): Promise<CbtTest> {
  return apiFetch(`/${school}/cbt/tests`, { method: 'POST', body: JSON.stringify(body) });
}

export interface CodeAssertionResult {
  description: string;
  passed: boolean;
}

/** What a CODE question's answer looks like once saved — full round-trip fidelity, including per-assertion results, not just the aggregate counts. */
export interface SavedCodeAnswer {
  passedCount: number;
  totalCount: number;
  html: string;
  css: string;
  js: string;
  results: CodeAssertionResult[];
}

export type AttemptSessionQuestion =
  | {
      id: string;
      type: 'OBJECTIVE';
      questionText: string;
      options: string[];
      points: number;
    }
  | {
      id: string;
      type: 'CODE';
      questionText: string;
      starterHtml: string | null;
      starterCss: string | null;
      starterJs: string | null;
      testAssertions: { description: string; assertion: string }[] | null;
      points: number;
    };

export interface AttemptSession {
  attemptId: string;
  deadlineAt: string;
  questions: AttemptSessionQuestion[];
  // OBJECTIVE answers are a plain option index (number); CODE answers
  // are the full SavedCodeAnswer object, results array included.
  savedAnswers: Record<string, number | SavedCodeAnswer>;
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

/**
 * Two question shapes share this one endpoint: a traditional
 * multiple-choice question (the default — `type` can be omitted
 * entirely for these, kept optional so every existing call site with
 * a plain { questionText, options, correctOptionIndex, points } object
 * still type-checks unchanged), and a code-challenge question, which
 * carries starter code plus test assertions instead of options. The
 * union (rather than one big interface with everything optional) means
 * TypeScript actually catches a caller mixing fields from both shapes,
 * e.g. sending `options` on a `type: 'CODE'` question.
 */
export type AddQuestionInput =
  | {
      type?: 'OBJECTIVE';
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      points: number;
    }
  | {
      type: 'CODE';
      questionText: string;
      starterHtml: string;
      starterCss: string;
      starterJs: string;
      testAssertions: { description: string; assertion: string }[];
      points: number;
    };

export function addQuestion(
  school: string,
  testId: string,
  body:
    | { type: 'OBJECTIVE'; questionText: string; options: string[]; correctOptionIndex: number; points: number }
    | {
        type: 'CODE';
        questionText: string;
        starterHtml: string;
        starterCss: string;
        starterJs: string;
        testAssertions: { description: string; assertion: string }[];
        points: number;
      },
) {
  return apiFetch(`/${school}/cbt/tests/${testId}/questions`, { method: 'POST', body: JSON.stringify(body) });
}

export function publishTest(school: string, testId: string, studentIds?: string[]): Promise<CbtTest> {
  return apiFetch<CbtTest>(`/${school}/cbt/tests/${testId}/publish`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), studentIds }),
  });
}

export interface CbtAttemptSummary {
  id: string;
  testId: string;
  studentId: string;
  answers: Record<string, number | SavedCodeAnswer>;
  objectiveScore: number | null;
  theoryScore: number | null;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  createdAt: string;
  beginAt: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  student: {
    firstName: string;
    lastName: string;
    studentId: string | null; // admission ID, e.g. "GRW/2026/0001"
  };
}

export function listAttempts(school: string, testId: string): Promise<CbtAttemptSummary[]> {
  return apiFetch(`/${school}/cbt/tests/${testId}/attempts`);
}

export function startAttempt(school: string, testId: string, studentId: string): Promise<AttemptSession> {
  return apiFetch(`/${school}/cbt/tests/${testId}/attempts/start`, { method: 'POST', body: JSON.stringify({ studentId }) });
}

/**
 * `answer` is a plain option index for OBJECTIVE questions or the full
 * SavedCodeAnswer for CODE questions — the backend stores whatever it's
 * given verbatim under `answers[questionId]`, so this just needs to
 * accept both shapes rather than assume every answer is numeric.
 */
export function saveAnswer(school: string, attemptId: string, questionId: string, answer: number | SavedCodeAnswer) {
  return apiFetch(`/${school}/cbt/tests/attempts/${attemptId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedOptionIndex: answer }),
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

export type AttemptDetailQuestion =
  | {
      id: string;
      type: 'OBJECTIVE';
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      selectedOptionIndex: number | null;
      isCorrect: boolean;
      points: number;
    }
  | {
      id: string;
      type: 'CODE';
      questionText: string;
      starterHtml: string | null;
      starterCss: string | null;
      starterJs: string | null;
      testAssertions: { description: string; assertion: string }[] | null;
      submittedHtml: string | null;
      submittedCss: string | null;
      submittedJs: string | null;
      passedCount: number;
      totalCount: number;
      assertionResults: CodeAssertionResult[] | null;
      points: number;
    };

export interface AttemptDetail {
  student: { firstName: string; lastName: string; studentId: string | null };
  objectiveScore: number | null;
  theoryScore: number | null;
  status: string;
  questions: AttemptDetailQuestion[];
}

export function getAttemptDetail(school: string, testId: string, attemptId: string): Promise<AttemptDetail> {
  return apiFetch(`/${school}/cbt/tests/${testId}/attempts/${attemptId}/detail`);
}

export async function downloadAttemptsExcel(school: string, testId: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/cbt/tests/${testId}/attempts/export`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}