// web/lib/endpoints/auth.ts
import { apiFetch, setToken, clearToken } from '../api';
import { setSessionUser, clearSessionUser } from '../session';
import type { LoginResponse, Role } from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.accessToken);
  setSessionUser(data.user);
  return data;
}

export function logout() {
  clearToken();
  clearSessionUser();
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/** SCHOOL_ADMIN inviting a teacher — no password set here; the teacher activates via an emailed link. */
export async function inviteStaff(body: { email: string; fullName: string }) {
  return apiFetch('/auth/invite-staff', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** SCHOOL_ADMIN creating STAFF, or SUPER_ADMIN creating any role. */
export async function createUser(body: {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  schoolId?: string;
}) {
  return apiFetch('/auth/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}