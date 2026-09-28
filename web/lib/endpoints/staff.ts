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
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  photoUrl: string | null;
  isHrManager: boolean;
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
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  photoUrl?: string;
  isHrManager?: boolean;
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
