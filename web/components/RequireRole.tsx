// web/components/RequireRole.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSessionUser } from '@/lib/session';
import type { Role } from '@/lib/types';
import LoadingScreen from './LoadingScreen';

/**
 * Wraps a page and actually blocks it — not just hides a nav link — for
 * roles that aren't allowed. A hidden link stops someone from clicking
 * their way in; it does nothing for a bookmark, a shared URL, or the
 * browser back button. This is the real gate (the backend enforces the
 * same rule independently).
 *
 * There is no separate HR role: the SCHOOL_ADMIN handles all HR work and
 * is the final approver; STAFF pages only ever show the caller's own data.
 */
export default function RequireRole({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (allow.includes(user.role)) {
      setStatus('allowed');
      return;
    }
    setStatus('denied');
    const fallback = user.schoolSlug ? `/${user.schoolSlug}/staff` : '/login';
    setTimeout(() => (window.location.href = fallback), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'checking') return <LoadingScreen />;
  if (status === 'denied') {
    return (
      <main className="mx-auto mt-16 max-w-sm px-4 text-center">
        <p className="text-sm text-red-600">This page isn't available for your account. Redirecting…</p>
      </main>
    );
  }
  return <>{children}</>;
}
