// web/lib/session.ts
import type { Role } from './types';

const USER_STORAGE_KEY = 'eschools_session_user';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  schoolId: string | null;
}

export function setSessionUser(user: SessionUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSessionUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_STORAGE_KEY);
}