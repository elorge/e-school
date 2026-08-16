// web/lib/endpoints/results.ts
import { apiFetch } from '../api';
import type { ResultEntry } from '../types';
import {
  enqueueResult,
  getQueuedResults,
  removeQueuedResult,
  queueLength,
  recordSyncFailure,
  getStuckResults,
  type QueuedResult,
} from '../offline-queue';

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
 *
 * As in the students queue: a `TypeError` means fetch never reached the
 * server at all — genuinely offline, so it's left to retry quietly.
 * Anything else means the server responded and still rejected it, which
 * is tracked per-item so a repeatedly-failing result gets flagged
 * instead of retried forever with no visibility.
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
    } catch (err) {
      if (!(err instanceof TypeError)) {
        recordSyncFailure(item.id, err instanceof Error ? err.message : 'Sync failed');
      }
      failed++;
    }
  }

  return { synced, failed };
}

export function getPendingResultsCount(): number {
  return queueLength();
}

/** Items that reached the server and were rejected repeatedly — not just waiting for a connection. */
export function getStuckResultsCount(threshold = 3): number {
  return getStuckResults(threshold).length;
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