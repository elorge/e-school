// web/lib/endpoints/students.ts
import { apiFetch } from '../api';
import type { Student } from '../types';
import { enqueueStudent, getQueuedStudents, removeQueuedStudent, queueLength } from '../offline-students-queue';

export function listStudents(school: string, classId?: string, includeWithdrawn = false): Promise<Student[]> {
  const params = new URLSearchParams();
  if (classId) params.set('classId', classId);
  if (includeWithdrawn) params.set('includeWithdrawn', 'true');
  const qs = params.toString();
  return apiFetch(`/${school}/students${qs ? `?${qs}` : ''}`);
}

export function listPendingSync(school: string): Promise<Student[]> {
  return apiFetch(`/${school}/students/pending-sync`);
}

export function getStudent(school: string, id: string): Promise<Student> {
  return apiFetch(`/${school}/students/${id}`);
}

/** Internal — always includes a clientReferenceId so retries never create duplicates. */
function createStudentRequest(
  school: string,
  clientReferenceId: string,
  body: { classId: string; firstName: string; lastName: string; photoUrl?: string; admissionYear: number },
): Promise<Student> {
  return apiFetch(`/${school}/students`, {
    method: 'POST',
    body: JSON.stringify({ ...body, clientReferenceId }),
  });
}

/**
 * The function the "Register student" button should actually call.
 * Tries immediately; on network failure, saves the registration locally
 * (with a stable clientReferenceId so a later retry can't create a
 * duplicate student) and returns `{ queued: true }` so the UI can tell
 * the teacher "saved on this device, will sync automatically."
 */
export async function registerStudent(
  school: string,
  body: { classId: string; firstName: string; lastName: string; photoUrl?: string; admissionYear: number },
): Promise<{ queued: boolean; student?: Student }> {
  const clientReferenceId = crypto.randomUUID();
  try {
    const student = await createStudentRequest(school, clientReferenceId, body);
    return { queued: false, student };
  } catch (err) {
    const isNetworkFailure = err instanceof TypeError || (err as any)?.status >= 500;
    if (!isNetworkFailure) throw err; // validation errors surface immediately, not queued

    enqueueStudent({ school, ...body });
    return { queued: true };
  }
}

/** Call on reconnect to flush anything registered offline. Safe to call repeatedly — server dedupes on clientReferenceId. */
export async function syncQueuedStudents(): Promise<{ synced: Student[]; failed: number }> {
  const queued = getQueuedStudents();
  const synced: Student[] = [];
  let failed = 0;

  for (const item of queued) {
    try {
      const student = await createStudentRequest(item.school, item.clientReferenceId, {
        classId: item.classId,
        firstName: item.firstName,
        lastName: item.lastName,
        photoUrl: item.photoUrl,
        admissionYear: item.admissionYear,
      });
      removeQueuedStudent(item.clientReferenceId);
      synced.push(student);
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

export function getPendingStudentsCount(): number {
  return queueLength();
}

/** Class teacher (of that student's class) or School Admin only. */
export function withdrawStudent(school: string, id: string): Promise<Student> {
  return apiFetch(`/${school}/students/${id}/withdraw`, {
    method: 'PATCH',
  });
}