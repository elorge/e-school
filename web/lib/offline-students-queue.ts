// web/lib/offline-students-queue.ts
const QUEUE_KEY = 'eschools_offline_students_queue';

export interface QueuedStudent {
  clientReferenceId: string; // doubles as the local queue id AND the server dedupe key
  school: string;
  classId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  admissionYear: number;
  queuedAt: string;
  attempts: number; // count of sync attempts that reached the server and still failed
  lastError?: string; // message from the most recent failed attempt
}

function readQueue(): QueuedStudent[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedStudent[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedStudent[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueStudent(
  entry: Omit<QueuedStudent, 'clientReferenceId' | 'queuedAt' | 'attempts' | 'lastError'>,
): QueuedStudent {
  const record: QueuedStudent = {
    ...entry,
    clientReferenceId: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };
  const queue = readQueue();
  queue.push(record);
  writeQueue(queue);
  return record;
}

export function getQueuedStudents(): QueuedStudent[] {
  return readQueue();
}

export function removeQueuedStudent(clientReferenceId: string) {
  writeQueue(readQueue().filter((q) => q.clientReferenceId !== clientReferenceId));
}

/**
 * Call when a sync attempt reaches the server and still fails (a real
 * HTTP error response, not a dropped connection). Increments the item's
 * attempt count so it can eventually be flagged as "needs attention"
 * instead of retried silently forever with a message implying it'll
 * resolve itself once the network comes back.
 */
export function recordSyncFailure(clientReferenceId: string, message: string) {
  const queue = readQueue();
  const index = queue.findIndex((q) => q.clientReferenceId === clientReferenceId);
  if (index === -1) return;
  queue[index] = { ...queue[index], attempts: queue[index].attempts + 1, lastError: message };
  writeQueue(queue);
}

export function queueLength(): number {
  return readQueue().length;
}

/** Items that have failed against a real server response repeatedly — not just "offline right now". */
export function getStuckStudents(threshold = 3): QueuedStudent[] {
  return readQueue().filter((q) => q.attempts >= threshold);
}