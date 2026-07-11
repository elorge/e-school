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

export function enqueueStudent(entry: Omit<QueuedStudent, 'clientReferenceId' | 'queuedAt'>): QueuedStudent {
  const record: QueuedStudent = {
    ...entry,
    clientReferenceId: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
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

export function queueLength(): number {
  return readQueue().length;
}