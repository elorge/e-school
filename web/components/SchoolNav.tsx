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
import { getMyStaffProfile } from '@/lib/endpoints/staff';
import { LayoutDashboard, GraduationCap, FileText, Wallet, Search, LogOut, ChevronDown, BookOpen, Settings, History, Users, Contact, Menu, X } from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHr, setIsHr] = useState(false);
  const school = useSchool();
  const t = navLabelsFor(school.locale);

  useEffect(() => {
    const sessionUser = getSessionUser();
    setUser(sessionUser);
    // Only a STAFF account can carry the isHrManager flag — SCHOOL_ADMIN
    // already sees everything HR does, and platform-wide roles never hit
    // this nav at all (see PlatformNav for those).
    if (sessionUser?.role === 'STAFF' && sessionUser.schoolSlug) {
      getMyStaffProfile(sessionUser.schoolSlug)
        .then((p) => setIsHr(!!p.isHrManager))
        .catch(() => setIsHr(false));
    }
  }, []);

  // Close the mobile menu automatically on any navigation away from it —
  // otherwise it'd stay open (stacked over the new page) after tapping a link.
  useEffect(() => {
    function handleRouteChange() {
      setMobileOpen(false);
    }
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
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

  const financeItems = [
    { href: `/${slug}/admin/pins`, text: t.generatePins },
    { href: `/${slug}/admin/fees`, text: t.fees },
    { href: `/${slug}/admin/inventory`, text: t.inventory },
    { href: `/${slug}/admin/accounting`, text: t.accounting },
  ];
  const hrItems = [
    { href: `/${slug}/admin/staff`, text: t.staffDirectory },
    { href: `/${slug}/admin/staff/payroll`, text: t.payroll },
    { href: `/${slug}/admin/staff/leave`, text: t.leave },
  ];

  return (
    <nav className="nav-wash sticky top-0 z-30 flex flex-col gap-2.5 border-b border-black/5 px-4 py-3">
      {/* Top bar: logo/name on the left, utility actions + hamburger (mobile) on the right. Never wraps. */}
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
            <button onClick={handleLogout} className="hidden items-center gap-1.5 whitespace-nowrap text-sm text-ink/50 sm:flex">
              <LogOut size={15} />
              {t.logOut}
            </button>
          )}
          {/* Hamburger — mobile only. The full link row below is hidden on small screens in favor of this. */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center justify-center rounded p-1 text-ink sm:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Link row — desktop/tablet only. Free to wrap, but wraps as a unit, centered. */}
      <div className="hidden flex-wrap items-center gap-x-4 gap-y-1.5 text-sm sm:flex sm:justify-center">
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
        {isSchoolAdmin && <DropdownMenu label={t.finance} icon={Wallet} items={financeItems} />}
        {(isSchoolAdmin || isHr) && <DropdownMenu label={t.hr} icon={Users} items={hrItems} />}
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

      {/* Mobile menu panel — everything stacked vertically, grouped under section headers instead of nested hover dropdowns (those don't work well with touch). */}
      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-black/5 pt-3 text-sm sm:hidden">
          {isSchoolAdmin && (
            <Link href={`/${slug}/admin`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
              <LayoutDashboard size={16} /> {t.admin}
            </Link>
          )}
          {isSchoolAdmin && (
            <Link href={`/${slug}/admin/settings`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
              <Settings size={16} /> {t.settings}
            </Link>
          )}
          {isSchoolAdmin && (
            <Link href={`/${slug}/admin/audit-log`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
              <History size={16} /> {t.auditLog}
            </Link>
          )}
          {isSchoolAdmin && (
            <Link href={`/${slug}/admin/documents`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
              <FileText size={16} /> {t.documents}
            </Link>
          )}
          {isStaffOrAdmin && (
            <Link href={`/${slug}/staff/me`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
              <Contact size={16} /> {t.myInfo}
            </Link>
          )}
          <Link href={`/${slug}/results`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
            <Search size={16} /> {t.checkResult}
          </Link>
          <Link href={`/${slug}/lessons`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-black/5">
            <BookOpen size={16} /> {t.lessons}
          </Link>

          {isStaffOrAdmin && (
            <MobileSection label={t.academic} icon={GraduationCap} items={academicItems} onNavigate={() => setMobileOpen(false)} />
          )}
          {isSchoolAdmin && <MobileSection label={t.finance} icon={Wallet} items={financeItems} onNavigate={() => setMobileOpen(false)} />}
          {(isSchoolAdmin || isHr) && <MobileSection label={t.hr} icon={Users} items={hrItems} onNavigate={() => setMobileOpen(false)} />}

          {user && (
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 rounded border-t border-black/5 px-2 py-2 pt-3 text-left text-ink/60"
            >
              <LogOut size={16} /> {t.logOut}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

/** Mobile-menu equivalent of DropdownMenu — always-expanded section (no hover state, since touch has none) grouped under a header with an indented item list. */
function MobileSection({
  label,
  icon: Icon,
  items,
  onNavigate,
}: {
  label: string;
  icon: React.ElementType;
  items: { href: string; text: string }[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5 pt-1">
      <p className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink/40">
        <Icon size={14} /> {label}
      </p>
      {items.map((item) => (
        <Link key={item.href} href={item.href} onClick={onNavigate} className="flex items-center gap-2 rounded py-2 pl-8 pr-2 hover:bg-black/5">
          {item.text}
        </Link>
      ))}
    </div>
  );
}