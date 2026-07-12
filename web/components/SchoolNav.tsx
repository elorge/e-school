// web/components/SchoolNav.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSessionUser, clearSessionUser, type SessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import PendingSyncBadge from './PendingSyncBadge';

function FinanceMenu({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1">
        Finance
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 flex w-40 flex-col rounded-lg border bg-white py-1 shadow-lg">
          <Link href={`/${slug}/admin/fees`} className="px-3 py-2 hover:bg-black/5" onClick={() => setOpen(false)}>
            Fees
          </Link>
          <Link href={`/${slug}/admin/inventory`} className="px-3 py-2 hover:bg-black/5" onClick={() => setOpen(false)}>
            Inventory
          </Link>
          <Link href={`/${slug}/admin/accounting`} className="px-3 py-2 hover:bg-black/5" onClick={() => setOpen(false)}>
            Accounting
          </Link>
        </div>
      )}
    </div>
  );
}

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
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={36} height={36} className="rounded-full" aria-hidden />
          <span className="font-display font-semibold">{schoolName}</span>
        </div>
        <div className="sm:hidden">
          <PendingSyncBadge />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin`}>Admin</Link>}
        {user?.role === 'SCHOOL_ADMIN' && <Link href={`/${slug}/admin/documents`}>Documents</Link>}
        {user?.role === 'SCHOOL_ADMIN' && <FinanceMenu slug={slug} />}
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