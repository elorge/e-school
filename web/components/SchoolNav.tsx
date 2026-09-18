// web/components/SchoolNav.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSessionUser, clearSessionUser, type SessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import PendingSyncBadge from './PendingSyncBadge';
import NotificationBell from './NotificationBell';
import { useSchool } from '@/lib/school-context';
import { navLabelsFor } from '@/lib/i18n/nav-labels';
import { LayoutDashboard, GraduationCap, FileText, Wallet, Search, LogOut, ChevronDown, BookOpen, Settings, History, Users, Contact } from 'lucide-react';

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
  const school = useSchool();
  const t = navLabelsFor(school.locale);

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
    { href: `/${slug}/staff`, text: t.students },
    { href: `/${slug}/staff/lessons`, text: t.lessonNotes },
    { href: `/${slug}/staff/cbt`, text: t.cbt },
    ...(sessionWrapEnabled ? [{ href: `/${slug}/staff/session-wrap`, text: t.sessionWrap }] : []),
  ];
  const adminAcademicItems = [
    { href: `/${slug}/admin/academic/classes`, text: t.classes },
    ...staffAcademicItems,
    { href: `/${slug}/admin/academic/promotion`, text: t.promoteStudents },
    { href: `/${slug}/admin/academic/terms`, text: t.terms },
    { href: `/${slug}/admin/academic/calendar`, text: t.calendar },
    { href: `/${slug}/admin/academic/grading`, text: t.gradingWeights },
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
              {t.logOut}
            </button>
          )}
        </div>
      </div>

      {/* Link row: free to wrap on narrow screens, but wraps as a unit, centered — never stranding one item alone. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm sm:justify-center">
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin`} className="flex items-center gap-1.5 whitespace-nowrap">
            <LayoutDashboard size={15} />
            {t.admin}
          </Link>
        )}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/settings`} className="flex items-center gap-1.5 whitespace-nowrap">
            <Settings size={15} />
            {t.settings}
          </Link>
        )}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/audit-log`} className="flex items-center gap-1.5 whitespace-nowrap">
            <History size={15} />
            {t.auditLog}
          </Link>
        )}
        {isStaffOrAdmin && <DropdownMenu label={t.academic} icon={GraduationCap} items={academicItems} />}
        {isSchoolAdmin && (
          <Link href={`/${slug}/admin/documents`} className="flex items-center gap-1.5 whitespace-nowrap">
            <FileText size={15} />
            {t.documents}
          </Link>
        )}
        {isSchoolAdmin && (
          <DropdownMenu
            label={t.finance}
            icon={Wallet}
            items={[
              { href: `/${slug}/admin/pins`, text: t.generatePins },
              { href: `/${slug}/admin/fees`, text: t.fees },
              { href: `/${slug}/admin/inventory`, text: t.inventory },
              { href: `/${slug}/admin/accounting`, text: t.accounting },
            ]}
          />
        )}
        {isSchoolAdmin && (
          <DropdownMenu
            label={t.hr}
            icon={Users}
            items={[
              { href: `/${slug}/admin/staff`, text: t.staffDirectory },
              { href: `/${slug}/admin/staff/payroll`, text: t.payroll },
              { href: `/${slug}/admin/staff/leave`, text: t.leave },
            ]}
          />
        )}
        {isStaffOrAdmin && (
          <Link href={`/${slug}/staff/me`} className="flex items-center gap-1.5 whitespace-nowrap">
            <Contact size={15} />
            {t.myInfo}
          </Link>
        )}
        <Link href={`/${slug}/results`} className="flex items-center gap-1.5 whitespace-nowrap">
          <Search size={15} />
          {t.checkResult}
        </Link>
        <Link href={`/${slug}/lessons`} className="flex items-center gap-1.5 whitespace-nowrap">
          <BookOpen size={15} />
          {t.lessons}
        </Link>
      </div>
    </nav>
  );
}