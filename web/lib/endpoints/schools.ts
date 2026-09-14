// web/lib/endpoints/schools.ts
import { apiFetch } from '../api';
import type { School } from '../types';

export function getSchoolBySlug(slug: string): Promise<School | null> {
  return apiFetch(`/schools/${slug}`);
}

/** SUPER_ADMIN only. */
export function listAllSchools(): Promise<School[]> {
  return apiFetch('/schools');
}

/** SUPER_ADMIN only. */
export function suspendSchool(slug: string): Promise<School> {
  return apiFetch(`/schools/${slug}/suspend`, { method: 'PATCH' });
}

/** SUPER_ADMIN only. */
export function reactivateSchool(slug: string): Promise<School> {
  return apiFetch(`/schools/${slug}/reactivate`, { method: 'PATCH' });
}

/** SUPER_ADMIN only. countryCode/currency required — see lib/currency.ts SUPPORTED_COUNTRIES for the picker. locale is optional — defaults from countryCode (see lib/locale.ts localeForCountry) if omitted. */
export function createSchool(body: {
  slug: string;
  name: string;
  code: string;
  countryCode: string;
  currency: string;
  locale?: string;
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

/** SUPER_ADMIN only — change any school's language by slug. */
export function setLocale(slug: string, locale: string): Promise<School> {
  return apiFetch(`/schools/${slug}/locale`, {
    method: 'PATCH',
    body: JSON.stringify({ locale }),
  });
}

/** SCHOOL_ADMIN self-service — change your own school's language. Used by the settings page's language switcher. */
export function setMyLocale(locale: string): Promise<School> {
  return apiFetch('/schools/me/locale', {
    method: 'PATCH',
    body: JSON.stringify({ locale }),
  });
}

export interface SignupRequest {
  id: string;
  schoolName: string;
  slug: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

/** countryCode/currency required — collected via the country picker on the public signup form. locale is optional — defaults from countryCode if omitted. */
export function requestSignup(body: {
  schoolName: string;
  slug: string;
  code: string;
  countryCode: string;
  currency: string;
  locale?: string;
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
export async function listSignupRequests(status?: string): Promise<SignupRequest[]> {
  const qs = status ? `?status=${status}` : '';
  const result = await apiFetch<SignupRequest[]>(`/schools/signup-requests${qs}`);
  return result ?? []; // apiFetch resolves undefined on a genuinely empty body — never let that leak into UI code expecting an array
}

export function approveSignupRequest(id: string): Promise<School> {
  return apiFetch(`/schools/signup-requests/${id}/approve`, { method: 'POST' });
}

export function rejectSignupRequest(id: string): Promise<SignupRequest> {
  return apiFetch(`/schools/signup-requests/${id}/reject`, { method: 'POST' });
}