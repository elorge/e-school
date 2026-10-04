// web/app/[school]/admin/staff/payroll/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Wallet, Plus } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { generatePayrollRun, listPayrollRuns, type PayrollRun } from '@/lib/endpoints/payroll';
import { ApiError } from '@/lib/api';

function firstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function lastDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}
function monthLabel() {
  return new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function PayrollRunsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ periodLabel: monthLabel(), periodStart: firstDayOfMonth(), periodEnd: lastDayOfMonth() });
  const [generating, setGenerating] = useState(false);

  async function load() {
    try {
      setRuns(await listPayrollRuns(params.school));
    } catch {
      setError('Could not load payroll runs.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      await generatePayrollRun(params.school, form);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate this payroll run.');
    } finally {
      setGenerating(false);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Wallet size={20} />
          {school.name} — Payroll
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
          <label className="flex flex-col gap-1 text-sm">
            Period label
            <input
              className="rounded border px-2 py-1.5"
              value={form.periodLabel}
              onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Start
            <input type="date" className="rounded border px-2 py-1.5" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            End
            <input type="date" className="rounded border px-2 py-1.5" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
          </label>
          <button disabled={generating} type="submit" className="flex items-center gap-1.5 rounded bg-ink px-4 py-1.5 text-sm text-white disabled:opacity-50">
            <Plus size={15} /> {generating ? 'Generating…' : 'Generate run'}
          </button>
        </form>
        <p className="-mt-4 text-xs text-ink/50">
          Generating a run snapshots every ACTIVE staff member&apos;s current salary/allowances/deductions into payslips for this
          period. To set someone&apos;s recurring deductions (pension, tax, etc.) or allowances first, open their profile from the{' '}
          <Link href={`/${params.school}/admin/staff`} className="underline">
            Staff Directory
          </Link>{' '}
          and edit &ldquo;Recurring deductions&rdquo; there — changes only apply to runs generated afterwards.
        </p>

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Gross</th>
                <th className="px-3 py-2">Deductions</th>
                <th className="px-3 py-2">Net</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t hover:bg-black/5">
                  <td className="px-3 py-2">
                    <Link href={`/${params.school}/admin/staff/payroll/${r.id}`} className="font-medium underline-offset-2 hover:underline">
                      {r.periodLabel}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2">{money(r.totalGrossKobo)}</td>
                  <td className="px-3 py-2">{money(r.totalDeductionsKobo)}</td>
                  <td className="px-3 py-2 font-medium">{money(r.totalNetKobo)}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-ink/50">
                    No payroll runs yet.
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
