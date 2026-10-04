// web/lib/endpoints/staff.ts
import { apiFetch, getToken } from '../api';
import type { User } from '../types';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'NYSC' | 'VOLUNTEER';
export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';

export interface SalaryLineItem {
  name: string;
  amountKobo: number;
}

export interface StaffProfile {
  id: string;
  schoolId: string;
  userId: string;
  staffId: string;
  department: string | null;
  designation: string | null;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfEmployment: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nextOfKinRelationship: string | null;
  maritalStatus: string | null;
  stateOfOrigin: string | null;
  qualifications: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  photoUrl: string | null;
  baseSalaryKobo: number;
  allowances: SalaryLineItem[] | null;
  deductions: SalaryLineItem[] | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role' | 'createdAt'>;
}

export interface StaffAttendanceRecord {
  id: string;
  direction: 'CLOCK_IN' | 'CLOCK_OUT';
  occurredAt: string;
}

export function listUnprofiledUsers(school: string): Promise<Pick<User, 'id' | 'email' | 'fullName' | 'role' | 'createdAt'>[]> {
  return apiFetch(`/${school}/staff/profiles/unassigned-users`);
}

export function listStaffProfiles(school: string, employmentStatus?: EmploymentStatus): Promise<StaffProfile[]> {
  const qs = employmentStatus ? `?employmentStatus=${employmentStatus}` : '';
  return apiFetch(`/${school}/staff/profiles${qs}`);
}

export function getMyStaffProfile(school: string): Promise<StaffProfile> {
  return apiFetch(`/${school}/staff/profiles/me`);
}

/** The personal details a staff member may edit about themselves. Pay, role, department and status are admin-only and not accepted by the API. An empty string clears a field. */
export interface UpdateMyStaffProfileBody {
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  stateOfOrigin?: string;
  qualifications?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

export function updateMyStaffProfile(school: string, body: UpdateMyStaffProfileBody): Promise<StaffProfile> {
  return apiFetch(`/${school}/staff/profiles/me`, { method: 'PATCH', body: JSON.stringify(body) });
}

/** Excel of every staff member's bank details, for the admin to pay from. */
export async function downloadStaffBankDetailsXlsx(school: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const token = getToken();
  const res = await fetch(`${API_URL}/${school}/staff/profiles/bank-details.xlsx`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Download failed');
  return res.blob();
}

export function getStaffProfile(school: string, id: string): Promise<StaffProfile> {
  return apiFetch(`/${school}/staff/profiles/${id}`);
}

export interface CreateStaffProfileBody {
  userId: string;
  department?: string;
  designation?: string;
  employmentType?: EmploymentType;
  dateOfEmployment?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  maritalStatus?: string;
  stateOfOrigin?: string;
  qualifications?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  photoUrl?: string;
  baseSalaryKobo?: number;
  allowances?: SalaryLineItem[];
  deductions?: SalaryLineItem[];
}

export function createStaffProfile(school: string, body: CreateStaffProfileBody): Promise<StaffProfile> {
  return apiFetch(`/${school}/staff/profiles`, { method: 'POST', body: JSON.stringify(body) });
}

export function updateStaffProfile(school: string, id: string, body: Partial<CreateStaffProfileBody> & { employmentStatus?: EmploymentStatus }): Promise<StaffProfile> {
  return apiFetch(`/${school}/staff/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function issueStaffIdCard(school: string, staffProfileId: string) {
  return apiFetch(`/${school}/staff/profiles/${staffProfileId}/id-card/issue`, { method: 'POST' });
}

export function listStaffAttendance(school: string, staffProfileId: string): Promise<StaffAttendanceRecord[]> {
  return apiFetch(`/${school}/staff/profiles/${staffProfileId}/attendance`);
}

async function downloadPdf(path: string): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Download failed');
  return res.blob();
}

export function downloadStaffIdCardPdf(school: string, staffProfileId: string): Promise<Blob> {
  return downloadPdf(`/${school}/staff/profiles/${staffProfileId}/id-card/pdf`);
}


// ─── ID card requests ────────────────────────────────────────────────

export type IdCardRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface IdCardRequest {
  id: string;
  staffProfileId: string;
  reason: string | null;
  status: IdCardRequestStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  staffProfile?: {
    id: string;
    userId: string;
    staffId: string;
    photoUrl: string | null;
    designation: string | null;
    department: string | null;
    user: { fullName: string; email: string };
  };
}

export interface MyIdCardStatus {
  profileId: string;
  hasPhoto: boolean;
  card: { issuedAt: string } | null;
  requests: IdCardRequest[];
}

export function getMyIdCardStatus(school: string): Promise<MyIdCardStatus> {
  return apiFetch(`/${school}/staff/id-card-requests/me`);
}

export function requestStaffIdCard(school: string, reason?: string): Promise<IdCardRequest> {
  return apiFetch(`/${school}/staff/id-card-requests`, { method: 'POST', body: JSON.stringify({ reason }) });
}

export function cancelStaffIdCardRequest(school: string, id: string): Promise<IdCardRequest> {
  return apiFetch(`/${school}/staff/id-card-requests/${id}/cancel`, { method: 'POST' });
}

export function listIdCardRequests(school: string, status?: IdCardRequestStatus): Promise<IdCardRequest[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/${school}/staff/id-card-requests${qs}`);
}

export function reviewIdCardRequest(school: string, id: string, approve: boolean, reviewNote?: string): Promise<IdCardRequest> {
  return apiFetch(`/${school}/staff/id-card-requests/${id}/review`, { method: 'POST', body: JSON.stringify({ approve, reviewNote }) });
}
