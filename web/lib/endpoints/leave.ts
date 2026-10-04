// web/lib/endpoints/leave.ts
import { apiFetch } from '../api';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveType {
  id: string;
  name: string;
  defaultDaysPerYear: number;
}

export interface LeaveBalance {
  id: string;
  leaveTypeId: string;
  year: number;
  daysAllotted: number;
  daysUsed: number;
}

export interface LeaveRequestRecord {
  id: string;
  staffProfileId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: LeaveStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  leaveType?: LeaveType;
  staffProfile?: { userId: string; staffId: string; user: { fullName: string; email: string } };
}

export function listLeaveTypes(school: string): Promise<LeaveType[]> {
  return apiFetch(`/${school}/leave/types`);
}

export function createLeaveType(school: string, body: { name: string; defaultDaysPerYear?: number }): Promise<LeaveType> {
  return apiFetch(`/${school}/leave/types`, { method: 'POST', body: JSON.stringify(body) });
}

export function myLeaveBalances(school: string, year?: number): Promise<LeaveBalance[]> {
  const qs = year ? `?year=${year}` : '';
  return apiFetch(`/${school}/leave/balances/me${qs}`);
}

export function requestLeave(school: string, body: { leaveTypeId?: string; leaveTypeName?: string; startDate: string; endDate: string; reason?: string }): Promise<LeaveRequestRecord> {
  return apiFetch(`/${school}/leave/requests`, { method: 'POST', body: JSON.stringify(body) });
}

export function myLeaveRequests(school: string): Promise<LeaveRequestRecord[]> {
  return apiFetch(`/${school}/leave/requests/me`);
}

export function listLeaveRequests(school: string, status?: LeaveStatus): Promise<LeaveRequestRecord[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/${school}/leave/requests${qs}`);
}

export function updateLeaveType(school: string, id: string, body: { name?: string; defaultDaysPerYear?: number }): Promise<LeaveType> {
  return apiFetch(`/${school}/leave/types/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function deleteLeaveType(school: string, id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/${school}/leave/types/${id}`, { method: 'DELETE' });
}

/** One-click backfill for a school with no leave types yet — see LeaveService.seedDefaultTypes on the backend. Safe to call more than once. */
export function seedDefaultLeaveTypes(school: string): Promise<LeaveType[]> {
  return apiFetch(`/${school}/leave/types/seed-defaults`, { method: 'POST' });
}

export function reviewLeaveRequest(school: string, id: string, approve: boolean, reviewNote?: string): Promise<LeaveRequestRecord> {
  return apiFetch(`/${school}/leave/requests/${id}/review`, { method: 'POST', body: JSON.stringify({ approve, reviewNote }) });
}

export function cancelLeaveRequest(school: string, id: string): Promise<LeaveRequestRecord> {
  return apiFetch(`/${school}/leave/requests/${id}/cancel`, { method: 'POST' });
}
