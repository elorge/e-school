// web/components/SchoolNav.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSessionUser, clearSessionUser, type SessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import PendingSyncBadge from './PendingSyncBadge';
import { LayoutDashboard, GraduationCap, FileText, Wallet, Search, LogOut, ChevronDown, BookOpen } from 'lucide-react';

function DropdownMenu({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: React.ElementType;
  items: { href: string; text: string }[];
}) {
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
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5">
        <Icon size={15} />
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
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
    { href: `/${slug}/staff/lessons`, text: 'Lesson Notes' },
    { href: `/${slug}/staff/cbt`, text: 'CBT' },
    { href: `/${slug}/admin/academic/terms`, text: 'Terms' },
    { href: `/${slug}/admin/academic/calendar`, text: 'Calendar' },
    ...(sessionWrapEnabled ? [{ href: `/${slug}/staff/session-wrap`, text: 'Session Wrap' }] : []),
  ];

  return (
    <nav className="nav-wash flex flex-col gap-2 border-b border-black/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin`} className="flex items-center gap-1.5">
            <LayoutDashboard size={15} />
            Admin
          </Link>
        )}
        {isStaffOrAdmin && <DropdownMenu label="Academic" icon={GraduationCap} items={academicItems} />}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/documents`} className="flex items-center gap-1.5">
            <FileText size={15} />
            Documents
          </Link>
        )}
        {isSchoolAdmin && (
          <DropdownMenu
            label="Finance"
            icon={Wallet}
            items={[
              { href: `/${slug}/admin/fees`, text: 'Fees' },
              { href: `/${slug}/admin/inventory`, text: 'Inventory' },
              { href: `/${slug}/admin/accounting`, text: 'Accounting' },
            ]}
          />
        )}
        <Link href={`/${slug}/results`} className="flex items-center gap-1.5">
          <Search size={15} />
          Check Result
        </Link>
        <Link href={`/${slug}/lessons`} className="flex items-center gap-1.5">
          <BookOpen size={15} />
          Lessons
        </Link>
        {user && (
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-500">
            <LogOut size={15} />
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