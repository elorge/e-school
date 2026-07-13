// web/components/SchoolNav.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSessionUser, clearSessionUser, type SessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import PendingSyncBadge from './PendingSyncBadge';

function DropdownMenu({ label, items }: { label: string; items: { href: string; text: string }[] }) {
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
        {label}
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 flex w-44 flex-col rounded-lg border bg-white py-1 shadow-lg">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="px-3 py-2 hover:bg-black/5" onClick={() => setOpen(false)}>
              {item.text}
            </Link>
          ))}
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

  const isSchoolAdmin = user?.role === 'SCHOOL_ADMIN';
  const isStaffOrAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'STAFF';

  const academicItems = [
    { href: `/${slug}/admin/academic/classes`, text: 'Classes' },
    { href: `/${slug}/staff`, text: 'Students' },
    { href: `/${slug}/staff/cbt`, text: 'CBT' },
    { href: `/${slug}/admin/academic/terms`, text: 'Terms' },
    { href: `/${slug}/admin/academic/calendar`, text: 'Calendar' },
    ...(sessionWrapEnabled ? [{ href: `/${slug}/staff/session-wrap`, text: 'Session Wrap' }] : []),
  ];

  return (
    <nav className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={36} height={36} aria-hidden />
          <span className="font-display font-semibold">{schoolName}</span>
        </div>
        <div className="sm:hidden">
          <PendingSyncBadge />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {isSchoolAdmin && <Link href={`/${slug}/admin`}>Admin</Link>}
        {isStaffOrAdmin && <DropdownMenu label="Academic" items={academicItems} />}
        {isSchoolAdmin && <Link href={`/${slug}/admin/documents`}>Documents</Link>}
        {isSchoolAdmin && (
          <DropdownMenu
            label="Finance"
            items={[
              { href: `/${slug}/admin/fees`, text: 'Fees' },
              { href: `/${slug}/admin/inventory`, text: 'Inventory' },
              { href: `/${slug}/admin/accounting`, text: 'Accounting' },
            ]}
          />
        )}
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