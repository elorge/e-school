// web/app/[school]/staff/hr/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/school-context';
import { getSessionUser } from '@/lib/session';
import { getMyStaffProfile, listStaffProfiles, listIdCardRequests } from '@/lib/endpoints/staff';
import { listLeaveRequests } from '@/lib/endpoints/leave';
import { listPayrollRuns, type PayrollRun } from '@/lib/endpoints/payroll';
import LoadingScreen from '@/components/LoadingScreen';
import { Users, Wallet, CalendarDays, ArrowRight, Contact } from 'lucide-react';

/**
 * The dashboard an HR-flagged STAFF account lands on instead of the
 * generic teaching dashboard (see app/[school]/staff/page.tsx, which
 * redirects here on mount for such an account) — a SCHOOL_ADMIN already
 * sees all of this and more under /admin, so this page is scoped to just
 * the three things HR access actually grants: Staff Directory, Payroll,
 * Leave. Access is checked here directly (not via RequireRole, whose
 * `allow` list would let in any STAFF account, HR-flagged or not) since
 * this page is specifically for HR staff, not staff in general.
 */
export default function HrDashboardPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [staffCount, setStaffCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingCardCount, setPendingCardCount] = useState(0);
  const [latestRun, setLatestRun] = useState<PayrollRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.role === 'SCHOOL_ADMIN') {
      setStatus('allowed');
      return;
    }
    if (user.role === 'STAFF') {
      getMyStaffProfile(params.school)
        .then((p) => setStatus(p.isHrManager ? 'allowed' : 'denied'))
        .catch(() => setStatus('denied'));
      return;
    }
    setStatus('denied');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'allowed') return;
    (async () => {
      try {
        const [staff, pendingLeave, runs, pendingCards] = await Promise.all([
          listStaffProfiles(params.school),
          listLeaveRequests(params.school, 'PENDING'),
          listPayrollRuns(params.school),
          listIdCardRequests(params.school, 'PENDING'),
        ]);
        setPendingCardCount(pendingCards.length);
        setStaffCount(staff.length);
        setPendingLeaveCount(pendingLeave.length);
        setLatestRun(runs[0] ?? null);
      } catch {
        setError('Could not load some of the summary data below — the links still work.');
      }
    })();
  }, [status, params.school]);

  if (status === 'checking') return <LoadingScreen />;
  if (status === 'denied') {
    return (
      <main className="mx-auto mt-16 max-w-sm px-4 text-center">
        <p className="text-sm text-red-600">This page isn't available for your account.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">HR Dashboard</h1>
        <p className="text-sm text-ink/60">{school.name}</p>
      </div>
      {error && <p className="text-sm text-amber-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/${params.school}/admin/staff`} className="card flex flex-col gap-2 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <Users size={20} className="text-brand-blue" />
            <ArrowRight size={15} className="text-ink/30" />
          </div>
          <p className="text-2xl font-semibold">{staffCount}</p>
          <p className="text-sm text-ink/60">Staff members — open Staff Directory</p>
        </Link>

        <Link href={`/${params.school}/admin/staff/leave`} className="card flex flex-col gap-2 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <CalendarDays size={20} className="text-brand-blue" />
            <ArrowRight size={15} className="text-ink/30" />
          </div>
          <p className="text-2xl font-semibold">{pendingLeaveCount}</p>
          <p className="text-sm text-ink/60">Leave request(s) awaiting your review</p>
        </Link>

        <Link href={`/${params.school}/admin/staff/id-cards`} className="card flex flex-col gap-2 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <Contact size={20} className="text-brand-blue" />
            <ArrowRight size={15} className="text-ink/30" />
          </div>
          <p className="text-2xl font-semibold">{pendingCardCount}</p>
          <p className="text-sm text-ink/60">ID card request(s) awaiting approval</p>
        </Link>

        <Link href={`/${params.school}/admin/staff/payroll`} className="card flex flex-col gap-2 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <Wallet size={20} className="text-brand-blue" />
            <ArrowRight size={15} className="text-ink/30" />
          </div>
          <p className="text-lg font-semibold">{latestRun ? latestRun.periodLabel : 'No runs yet'}</p>
          <p className="text-sm text-ink/60">
            {latestRun ? `Latest payroll run — ${latestRun.status.toLowerCase()}` : 'Open Payroll to generate the first one'}
          </p>
        </Link>
      </div>

      <div className="card">
        <p className="text-sm text-ink/60">
          You have HR access on this account: you can manage the Staff Directory, run and approve Payroll, and review Leave requests,
          the same as a school admin can. You don&apos;t have access to Settings, Fees, Accounting, or other admin-only areas. Want to
          see your own info or apply for leave yourself?{' '}
          <Link href={`/${params.school}/staff/me`} className="underline">
            Go to My Info
          </Link>{' '}
          ·{' '}
          <Link href={`/${params.school}/staff/leave`} className="underline">
            Go to My Leave
          </Link>
        </p>
      </div>
    </main>
  );
}
