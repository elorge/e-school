// web/lib/endpoints/results.ts
import { apiFetch } from '../api';
import type { ResultEntry } from '../types';
import { enqueueResult, getQueuedResults, removeQueuedResult, queueLength, type QueuedResult } from '../offline-queue';

export function getResult(school: string, studentId: string, termId: string): Promise<ResultEntry | null> {
  return apiFetch(`/${school}/students/${studentId}/results/${termId}`);
}

/** STAFF may only submit under their own id as classTeacherId — enforced server-side. */
export function upsertResult(
  school: string,
  studentId: string,
  termId: string,
  body: { subjectScores: Record<string, number>; teacherComment?: string; classTeacherId: string },
): Promise<ResultEntry> {
  return apiFetch(`/${school}/students/${studentId}/results/${termId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * The function the "Save" button should actually call. Tries to submit
 * immediately; if that fails (offline, timeout, server unreachable — NOT
 * a validation error, which should surface to the teacher right away),
 * it saves locally instead and returns `{ queued: true }` so the UI can
 * show "Saved offline — will sync automatically" instead of losing the
 * teacher's work.
 */
export async function saveResult(
  school: string,
  studentId: string,
  termId: string,
  body: { subjectScores: Record<string, number>; teacherComment?: string; classTeacherId: string },
): Promise<{ queued: boolean; result?: ResultEntry }> {
  try {
    const result = await upsertResult(school, studentId, termId, body);
    return { queued: false, result };
  } catch (err) {
    // A validation error (e.g. score out of range) is a 400 from the
    // server and should be shown to the teacher, not silently queued —
    // queuing it would just fail again on every retry. Only network-level
    // failures (fetch throws before getting a response at all, or a
    // clearly transient 5xx) should be queued.
    const isNetworkFailure = err instanceof TypeError || (err as any)?.status >= 500;
    if (!isNetworkFailure) throw err;

    enqueueResult({ school, studentId, termId, body });
    return { queued: true };
  }
}

/**
 * Call this on reconnect (see useOfflineResultsSync hook) to flush
 * anything saved locally. Safe to call repeatedly — the backend's
 * upsertResult is idempotent per (school, studentId, termId), so a
 * retry of an already-synced item just overwrites with identical data.
 */
export async function syncQueuedResults(): Promise<{ synced: number; failed: number }> {
  const queued = getQueuedResults();
  let synced = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      await upsertResult(item.school, item.studentId, item.termId, item.body);
      removeQueuedResult(item.id);
      synced++;
    } catch {
      // Leave it in the queue — will retry again on the next sync trigger.
      failed++;
    }
  }

  return { synced, failed };
}

export function getPendingResultsCount(): number {
  return queueLength();
}

export type { QueuedResult };

/** Returns a PDF as a Blob — open it with URL.createObjectURL for download/preview. */
export async function downloadReportPdf(school: string, studentId: string, termId: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const { getToken } = await import('../api');
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/students/${studentId}/results/${termId}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch report PDF: ${res.status}`);
  return res.blob();
}