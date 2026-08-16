// web/lib/offline-queue.ts
// A "save now, keep retrying until it lands" queue, stored in the
// browser. Unlike student sync (which needs the SERVER to assign an ID),
// a result submission is already complete data on the client — so this
// queue just needs to keep trying until the network cooperates.

const QUEUE_KEY = 'eschools_offline_results_queue';

export interface QueuedResult {
  id: string; // local id only — never sent to the server, just for managing the queue
  school: string;
  studentId: string;
  termId: string;
  body: { subjectScores: Record<string, number>; teacherComment?: string; classTeacherId: string };
  queuedAt: string;
  attempts: number; // count of sync attempts that reached the server and still failed
  lastError?: string;
}

function readQueue(): QueuedResult[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedResult[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedResult[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueResult(entry: Omit<QueuedResult, 'id' | 'queuedAt' | 'attempts' | 'lastError'>): QueuedResult {
  const queue = readQueue();
  // If this student+term is already queued, replace it rather than
  // stacking two entries — the teacher is correcting their own draft,
  // not submitting twice. A fresh edit also resets the attempt count:
  // it's new data, not a retry of whatever failed before.
  const existingIndex = queue.findIndex(
    (q) => q.studentId === entry.studentId && q.termId === entry.termId && q.school === entry.school,
  );
  const record: QueuedResult = { ...entry, id: crypto.randomUUID(), queuedAt: new Date().toISOString(), attempts: 0 };
  if (existingIndex >= 0) queue[existingIndex] = record;
  else queue.push(record);
  writeQueue(queue);
  return record;
}

export function getQueuedResults(): QueuedResult[] {
  return readQueue();
}

export function removeQueuedResult(id: string) {
  writeQueue(readQueue().filter((q) => q.id !== id));
}

/** Call when a sync attempt reaches the server and still fails (a real HTTP error, not a dropped connection). */
export function recordSyncFailure(id: string, message: string) {
  const queue = readQueue();
  const index = queue.findIndex((q) => q.id === id);
  if (index === -1) return;
  queue[index] = { ...queue[index], attempts: queue[index].attempts + 1, lastError: message };
  writeQueue(queue);
}

export function queueLength(): number {
  return readQueue().length;
}

/** Items that have failed against a real server response repeatedly — not just "offline right now". */
export function getStuckResults(threshold = 3): QueuedResult[] {
  return readQueue().filter((q) => q.attempts >= threshold);
}