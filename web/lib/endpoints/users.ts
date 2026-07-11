// web/lib/endpoints/users.ts
import { apiFetch } from '../api';
import type { User } from '../types';

export function listStaff(school: string): Promise<User[]> {
  return apiFetch(`/${school}/users`);
}

/**
 * If the staff member has owned classes/students, this throws a 400 with
 * { classesCreated, classesTeaching, studentsCreated } counts. Catch that,
 * prompt the admin to pick a replacement staff member, then retry with
 * reassignToStaffId set.
 */
export function removeStaff(school: string, userId: string, reassignToStaffId?: string): Promise<{ removed: boolean }> {
  const qs = reassignToStaffId ? `?reassignToStaffId=${reassignToStaffId}` : '';
  return apiFetch(`/${school}/users/${userId}${qs}`, { method: 'DELETE' });
}