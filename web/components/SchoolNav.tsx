// web/components/SchoolNav.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSessionUser, clearSessionUser, type SessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import PendingSyncBadge from './PendingSyncBadge';
import NotificationBell from './NotificationBell';
import { LayoutDashboard, GraduationCap, FileText, Wallet, Search, LogOut, ChevronDown, BookOpen, Settings, History } from 'lucide-react';

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
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 whitespace-nowrap">
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

  // Staff sees only what they can actually do something with — Classes,
  // Terms, Calendar creation, and PIN generation are SCHOOL_ADMIN-only
  // on the backend, so they never belonged in a shared list.
  const staffAcademicItems = [
    { href: `/${slug}/staff`, text: 'Students' },
    { href: `/${slug}/staff/lessons`, text: 'Lesson Notes' },
    { href: `/${slug}/staff/cbt`, text: 'CBT' },
    ...(sessionWrapEnabled ? [{ href: `/${slug}/staff/session-wrap`, text: 'Session Wrap' }] : []),
  ];
  const adminAcademicItems = [
    { href: `/${slug}/admin/academic/classes`, text: 'Classes' },
    ...staffAcademicItems,
    { href: `/${slug}/admin/academic/promotion`, text: 'Promote Students' },
    { href: `/${slug}/admin/academic/terms`, text: 'Terms' },
    { href: `/${slug}/admin/academic/calendar`, text: 'Calendar' },
    { href: `/${slug}/admin/academic/grading`, text: 'Grading Weights' },
  ];
  const academicItems = isSchoolAdmin ? adminAcademicItems : staffAcademicItems;

  return (
    <nav className="nav-wash flex flex-col gap-2.5 border-b border-black/5 px-4 py-3">
      {/* Top bar: logo/name on the left, utility actions on the right. Never wraps. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-white p-1 shadow-sm">
            <Image src="/logo.png" alt="" width={28} height={28} aria-hidden />
          </div>
          <span className="font-display font-semibold">{schoolName}</span>
        </div>
        <div className="flex items-center gap-3">
          <PendingSyncBadge />
          <NotificationBell />
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-1.5 whitespace-nowrap text-sm text-ink/50">
              <LogOut size={15} />
              Log out
            </button>
          )}
        </div>
      </div>

      {/* Link row: free to wrap on narrow screens, but wraps as a unit, centered — never stranding one item alone. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm sm:justify-center">
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin`} className="flex items-center gap-1.5 whitespace-nowrap">
            <LayoutDashboard size={15} />
            Admin
          </Link>
        )}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/settings`} className="flex items-center gap-1.5 whitespace-nowrap">
            <Settings size={15} />
            Settings
          </Link>
        )}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/audit-log`} className="flex items-center gap-1.5 whitespace-nowrap">
            <History size={15} />
            Audit Log
          </Link>
        )}
        {isStaffOrAdmin && <DropdownMenu label="Academic" icon={GraduationCap} items={academicItems} />}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/documents`} className="flex items-center gap-1.5 whitespace-nowrap">
            <FileText size={15} />
            Documents
          </Link>
        )}
        {isSchoolAdmin && (
          <DropdownMenu
            label="Finance"
            icon={Wallet}
            items={[
              { href: `/${slug}/admin/pins`, text: 'Generate PINs' },
              { href: `/${slug}/admin/fees`, text: 'Fees' },
              { href: `/${slug}/admin/inventory`, text: 'Inventory' },
              { href: `/${slug}/admin/accounting`, text: 'Accounting' },
            ]}
          />
        )}
        <Link href={`/${slug}/results`} className="flex items-center gap-1.5 whitespace-nowrap">
          <Search size={15} />
          Check Result
        </Link>
        <Link href={`/${slug}/lessons`} className="flex items-center gap-1.5 whitespace-nowrap">
          <BookOpen size={15} />
          Lessons
        </Link>
      </div>
    </nav>
  );
}