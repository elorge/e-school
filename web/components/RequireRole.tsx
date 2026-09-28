// web/components/RequireRole.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSessionUser } from '@/lib/session';
import { getMyStaffProfile } from '@/lib/endpoints/staff';
import type { Role } from '@/lib/types';
import LoadingScreen from './LoadingScreen';

/**
 * Wraps a page and actually blocks it — not just hides a nav link — for
 * roles that aren't allowed. A hidden link stops someone from clicking
 * their way in; it does nothing for a bookmark, a shared URL, or the
 * browser back button. This is the real gate.
 *
 * Pass `allowHr` on a page whose backend routes carry @AllowHr() (Staff
 * Directory, Payroll, Leave administration) so a STAFF account flagged
 * as HR (StaffProfile.isHrManager) isn't bounced off a page their API
 * calls would otherwise succeed on. Has no effect on SCHOOL_ADMIN, and
 * no effect on a STAFF account that isn't HR-flagged.
 */
export default function RequireRole({
  allow,
  allowHr = false,
  children,
}: {
  allow: Role[];
  allowHr?: boolean;
  children: React.ReactNode;
}) {
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
    if (allowHr && user.role === 'STAFF' && user.schoolSlug) {
      getMyStaffProfile(user.schoolSlug)
        .then((profile) => {
          if (profile.isHrManager) {
            setStatus('allowed');
          } else {
            deny(user.schoolSlug);
          }
        })
        .catch(() => deny(user.schoolSlug));
      return;
    }
    deny(user.schoolSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function deny(schoolSlug: string | null) {
    setStatus('denied');
    const fallback = schoolSlug ? `/${schoolSlug}/staff` : '/login';
    setTimeout(() => (window.location.href = fallback), 1500);
  }

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