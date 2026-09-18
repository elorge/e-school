// web/app/[school]/admin/staff/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Contact, Plus, Trash2, Download } from 'lucide-react';
import { formatMoney, majorToMinor, minorToMajor } from '@/lib/currency';
import {
  getStaffProfile,
  updateStaffProfile,
  issueStaffIdCard,
  downloadStaffIdCardPdf,
  listStaffAttendance,
  type StaffProfile,
  type SalaryLineItem,
  type EmploymentStatus,
  type EmploymentType,
  type StaffAttendanceRecord,
} from '@/lib/endpoints/staff';
import { ApiError } from '@/lib/api';

const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'];
const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'NYSC', 'VOLUNTEER'];

function LineItemEditor({
  title,
  items,
  onChange,
  currency,
}: {
  title: string;
  items: SalaryLineItem[];
  onChange: (items: SalaryLineItem[]) => void;
  currency: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{title}</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="flex-1 rounded border px-2 py-1 text-sm"
            placeholder="Name (e.g. Housing Allowance)"
            value={item.name}
            onChange={(e) => onChange(items.map((it, j) => (j === i ? { ...it, name: e.target.value } : it)))}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-32 rounded border px-2 py-1 text-sm"
            placeholder={currency}
            value={minorToMajor(item.amountKobo, currency)}
            onChange={(e) =>
              onChange(items.map((it, j) => (j === i ? { ...it, amountKobo: majorToMinor(Number(e.target.value), currency) } : it)))
            }
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-600">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { name: '', amountKobo: 0 }])}
        className="flex w-fit items-center gap-1 text-xs text-ink/60"
      >
        <Plus size={13} /> Add line
      </button>
    </div>
  );
}

export default function StaffProfileDetailPage({ params }: { params: { school: string; id: string } }) {
  const school = useSchool();
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [attendance, setAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function load() {
    try {
      const [p, a] = await Promise.all([getStaffProfile(params.school, params.id), listStaffAttendance(params.school, params.id)]);
      setProfile(p);
      setAttendance(a);
    } catch {
      setError('Could not load this staff profile.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateStaffProfile(params.school, profile.id, {
        department: profile.department ?? undefined,
        designation: profile.designation ?? undefined,
        employmentType: profile.employmentType,
        employmentStatus: profile.employmentStatus,
        phone: profile.phone ?? undefined,
        address: profile.address ?? undefined,
        nextOfKinName: profile.nextOfKinName ?? undefined,
        nextOfKinPhone: profile.nextOfKinPhone ?? undefined,
        bankName: profile.bankName ?? undefined,
        bankAccountName: profile.bankAccountName ?? undefined,
        bankAccountNumber: profile.bankAccountNumber ?? undefined,
        baseSalaryKobo: profile.baseSalaryKobo,
        allowances: profile.allowances ?? [],
        deductions: profile.deductions ?? [],
      });
      setProfile(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleIssueCard() {
    try {
      await issueStaffIdCard(params.school, params.id);
      await handleDownloadCard();
    } catch {
      setError('Could not issue an ID card.');
    }
  }

  async function handleDownloadCard() {
    try {
      const blob = await downloadStaffIdCardPdf(params.school, params.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      setError('No ID card has been issued yet — issue one first.');
    }
  }

  if (isLoading) return <LoadingScreen />;
  if (!profile) return <p className="p-6 text-sm text-red-600">{error ?? 'Not found.'}</p>;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{profile.user.fullName}</h1>
            <p className="text-sm text-ink/60">
              {profile.staffId} · {profile.user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleIssueCard} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm">
              <Contact size={15} /> Issue ID card
            </button>
            <button onClick={handleDownloadCard} className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-sm text-white">
              <Download size={15} /> Download card
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {savedAt && <p className="text-sm text-green-700">Saved.</p>}

        <form onSubmit={handleSave} className="flex flex-col gap-5 rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Department
              <input
                className="rounded border px-2 py-1.5"
                value={profile.department ?? ''}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Designation
              <input
                className="rounded border px-2 py-1.5"
                value={profile.designation ?? ''}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Employment type
              <select
                className="rounded border px-2 py-1.5"
                value={profile.employmentType}
                onChange={(e) => setProfile({ ...profile, employmentType: e.target.value as EmploymentType })}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Employment status
              <select
                className="rounded border px-2 py-1.5"
                value={profile.employmentStatus}
                onChange={(e) => setProfile({ ...profile, employmentStatus: e.target.value as EmploymentStatus })}
              >
                {EMPLOYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Phone
              <input className="rounded border px-2 py-1.5" value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Address
              <input className="rounded border px-2 py-1.5" value={profile.address ?? ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Next of kin — name
              <input
                className="rounded border px-2 py-1.5"
                value={profile.nextOfKinName ?? ''}
                onChange={(e) => setProfile({ ...profile, nextOfKinName: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Next of kin — phone
              <input
                className="rounded border px-2 py-1.5"
                value={profile.nextOfKinPhone ?? ''}
                onChange={(e) => setProfile({ ...profile, nextOfKinPhone: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Bank name
              <input className="rounded border px-2 py-1.5" value={profile.bankName ?? ''} onChange={(e) => setProfile({ ...profile, bankName: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Bank account name
              <input
                className="rounded border px-2 py-1.5"
                value={profile.bankAccountName ?? ''}
                onChange={(e) => setProfile({ ...profile, bankAccountName: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Bank account number
              <input
                className="rounded border px-2 py-1.5"
                value={profile.bankAccountNumber ?? ''}
                onChange={(e) => setProfile({ ...profile, bankAccountNumber: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Monthly base salary ({school.currency})
              <input
                type="number"
                min={0}
                step="0.01"
                className="rounded border px-2 py-1.5"
                value={minorToMajor(profile.baseSalaryKobo, school.currency)}
                onChange={(e) => setProfile({ ...profile, baseSalaryKobo: majorToMinor(Number(e.target.value), school.currency) })}
              />
            </label>
          </div>

          <LineItemEditor
            title="Recurring allowances"
            items={profile.allowances ?? []}
            currency={school.currency}
            onChange={(items) => setProfile({ ...profile, allowances: items })}
          />
          <LineItemEditor
            title="Recurring deductions"
            items={profile.deductions ?? []}
            currency={school.currency}
            onChange={(items) => setProfile({ ...profile, deductions: items })}
          />

          <p className="text-sm text-ink/60">
            Gross: {money(profile.baseSalaryKobo + (profile.allowances ?? []).reduce((s, a) => s + a.amountKobo, 0))} · Net after
            deductions:{' '}
            {money(
              profile.baseSalaryKobo +
                (profile.allowances ?? []).reduce((s, a) => s + a.amountKobo, 0) -
                (profile.deductions ?? []).reduce((s, d) => s + d.amountKobo, 0),
            )}
          </p>

          <button disabled={saving} type="submit" className="self-start rounded bg-ink px-4 py-1.5 text-sm text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="rounded-lg border bg-white p-4">
          <p className="mb-2 text-sm font-medium">Recent gate attendance</p>
          {attendance.length === 0 ? (
            <p className="text-sm text-ink/50">No attendance scans recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {attendance.slice(0, 10).map((a) => (
                <li key={a.id} className="flex justify-between border-b py-1 last:border-0">
                  <span>{a.direction === 'CLOCK_IN' ? 'Clock in' : 'Clock out'}</span>
                  <span className="text-ink/50">{new Date(a.occurredAt).toLocaleString(school.locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </RequireRole>
  );
}
