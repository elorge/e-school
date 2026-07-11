// web/lib/endpoints/schools.ts
import { apiFetch } from '../api';
import type { School } from '../types';

export function getSchoolBySlug(slug: string): Promise<School | null> {
  return apiFetch(`/schools/${slug}`);
}

/** SUPER_ADMIN only. */
export function createSchool(body: {
  slug: string;
  name: string;
  code: string;
  logoUrl?: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}): Promise<School> {
  return apiFetch('/schools', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** SUPER_ADMIN only. */
export function setSessionWrapEnabled(slug: string, enabled: boolean): Promise<School> {
  return apiFetch(`/schools/${slug}/features/session-wrap`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

/** SUPER_ADMIN only. Pass null to clear the override. */
export function setPriceOverride(slug: string, pricePerStudentKobo: number | null): Promise<School> {
  return apiFetch(`/schools/${slug}/price-override`, {
    method: 'PATCH',
    body: JSON.stringify({ pricePerStudentKobo }),
  });
}

export interface SignupRequest {
  id: string;
  schoolName: string;
  slug: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export function requestSignup(body: {
  schoolName: string;
  slug: string;
  code: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  phone?: string;
}): Promise<SignupRequest> {
  return apiFetch('/schools/signup-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** SUPER_ADMIN only. */
export function listSignupRequests(status?: string): Promise<SignupRequest[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/schools/signup-requests${qs}`);
}

export function approveSignupRequest(id: string): Promise<School> {
  return apiFetch(`/schools/signup-requests/${id}/approve`, { method: 'POST' });
}

export function rejectSignupRequest(id: string): Promise<SignupRequest> {
  return apiFetch(`/schools/signup-requests/${id}/reject`, { method: 'POST' });
}