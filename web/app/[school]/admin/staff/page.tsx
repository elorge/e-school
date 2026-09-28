// web/app/[school]/admin/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/school-context';
import { getSessionUser } from '@/lib/session';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Users, UserPlus } from 'lucide-react';
import { formatMoney, majorToMinor } from '@/lib/currency';
import {
  listStaffProfiles,
  listUnprofiledUsers,
  createStaffProfile,
  type StaffProfile,
  type EmploymentType,
} from '@/lib/endpoints/staff';
import type { User } from '@/lib/types';
import { ApiError } from '@/lib/api';

const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'NYSC', 'VOLUNTEER'];

export default function StaffDirectoryPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  // Only a real SCHOOL_ADMIN can grant HR access at onboarding time — see
  // StaffService.createProfile, which silently ignores isHrManager from
  // any other caller (an HR-flagged staff member onboarding a colleague
  // included), so that checkbox is hidden for them rather than shown and
  // quietly doing nothing.
  const viewerIsAdmin = getSessionUser()?.role === 'SCHOOL_ADMIN';
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [unprofiled, setUnprofiled] = useState<Pick<User, 'id' | 'email' | 'fullName' | 'role'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showOnboard, setShowOnboard] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    department: '',
    designation: '',
    employmentType: 'FULL_TIME' as EmploymentType,
    baseSalaryMajor: 0,
    isHrManager: false,
  });

  async function load() {
    try {
      const [p, u] = await Promise.all([listStaffProfiles(params.school), listUnprofiledUsers(params.school)]);
      setProfiles(p);
      setUnprofiled(u);
    } catch {
      setError('Could not load staff.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createStaffProfile(params.school, {
        userId: form.userId,
        department: form.department || undefined,
        designation: form.designation || undefined,
        employmentType: form.employmentType,
        baseSalaryKobo: majorToMinor(form.baseSalaryMajor, school.currency),
        ...(viewerIsAdmin ? { isHrManager: form.isHrManager } : {}),
      });
      setForm({ userId: '', department: '', designation: '', employmentType: 'FULL_TIME', baseSalaryMajor: 0, isHrManager: false });
      setShowOnboard(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not onboard this staff member.');
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']} allowHr>
      <main className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Users size={20} />
            {school.name} — Staff Directory
          </h1>
          <button
            onClick={() => setShowOnboard((s) => !s)}
            className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-sm text-white"
          >
            <UserPlus size={15} />
            Onboard staff
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {showOnboard && (
          <form onSubmit={handleOnboard} className="flex flex-col gap-3 rounded-lg border bg-white p-4">
            <p className="text-sm text-ink/60">
              Pick an existing staff/admin account to give them an HR profile. Don&apos;t see who you&apos;re looking for? Create their
              login first from Settings → invite staff.
            </p>
            <label className="flex flex-col gap-1 text-sm">
              Account
              <select
                required
                className="rounded border px-2 py-1.5"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              >
                <option value="">Select an account…</option>
                {unprofiled.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Department
                <input className="rounded border px-2 py-1.5" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Designation / Job title
                <input className="rounded border px-2 py-1.5" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Employment type
                <select
                  className="rounded border px-2 py-1.5"
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentType })}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Monthly base salary ({school.currency})
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="rounded border px-2 py-1.5"
                  value={form.baseSalaryMajor}
                  onChange={(e) => setForm({ ...form, baseSalaryMajor: Number(e.target.value) })}
                />
              </label>
            </div>
            {viewerIsAdmin && (
              <label className="flex items-center gap-2 rounded border bg-amber-50/60 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isHrManager}
                  onChange={(e) => setForm({ ...form, isHrManager: e.target.checked })}
                />
                <span>Grant HR access — Staff Directory, Payroll, and Leave approvals, without other admin permissions.</span>
              </label>
            )}
            <button type="submit" className="self-start rounded bg-ink px-4 py-1.5 text-sm text-white">
              Create HR profile
            </button>
          </form>
        )}

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-2">Staff ID</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Designation</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Base salary</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t hover:bg-black/5">
                  <td className="px-3 py-2">
                    <Link href={`/${params.school}/admin/staff/${p.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
                      {p.staffId}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {p.user.fullName}
                    {p.isHrManager && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                        HR
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{p.department ?? '—'}</td>
                  <td className="px-3 py-2">{p.designation ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.employmentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2">{money(p.baseSalaryKobo)}</td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-ink/50">
                    No staff HR profiles yet — onboard someone above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </RequireRole>
  );
}
