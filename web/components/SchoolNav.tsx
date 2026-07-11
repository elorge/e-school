// web/components/SchoolNav.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSessionUser, clearSessionUser, type SessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import PendingSyncBadge from './PendingSyncBadge';

export default function SchoolNav({
  slug,
  schoolName,
  sessionWrapEnabled,
}: {
  slug: string;
  schoolName: string;
  sessionWrapEnabled: boolean;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  function handleLogout() {
    clearToken();
    clearSessionUser();
    window.location.href = '/login';
  }

  return (
    <nav className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold">{schoolName}</span>
        <div className="sm:hidden">
          <PendingSyncBadge />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin`}>Admin</Link>}
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin/documents`}>Documents</Link>}
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin/fees`}>Fees</Link>}
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin/inventory`}>Inventory</Link>}
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin/accounting`}>Accounting</Link>}
        {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'STAFF') && <Link href={`/${slug}/staff`}>Staff</Link>}
        {sessionWrapEnabled && (user?.role === 'SCHOOL_ADMIN' || user?.role === 'STAFF') && (
          <Link href={`/${slug}/staff/session-wrap`}>Session Wrap</Link>
        )}
        {(user?.role === 'SCHOOL_ADMIN' || user?.role === 'STAFF') && <Link href={`/${slug}/staff/cbt`}>CBT</Link>}
        <Link href={`/${slug}/results`}>Check Result</Link>
        {user && (
          <button onClick={handleLogout} className="text-gray-500 underline">
            Log out
          </button>
        )}
      </div>
      <div className="hidden sm:block">
        <PendingSyncBadge />
      </div>
    </nav>
  );
}