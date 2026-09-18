// web/app/[school]/admin/staff/payroll/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { CheckCircle2, Download, Landmark } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import {
  approvePayrollRun,
  getPayrollRun,
  markPayslipPaid,
  downloadPayslipPdf,
  getDisbursementSchedule,
  downloadDisbursementScheduleCsv,
  type PayrollRun,
} from '@/lib/endpoints/payroll';
import { ApiError } from '@/lib/api';

export default function PayrollRunDetailPage({ params }: { params: { school: string; id: string } }) {
  const school = useSchool();
  const money = (kobo: number, currency: string) => formatMoney(kobo, currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [referenceByPayslip, setReferenceByPayslip] = useState<Record<string, string>>({});
  const [missingBankDetails, setMissingBankDetails] = useState<{ fullName: string; staffId: string }[]>([]);

  async function load() {
    try {
      const loadedRun = await getPayrollRun(params.school, params.id);
      setRun(loadedRun);
      if (loadedRun.status !== 'DRAFT') {
        const schedule = await getDisbursementSchedule(params.school, params.id);
        setMissingBankDetails(schedule.missingBankDetails);
      }
    } catch {
      setError('Could not load this payroll run.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleApprove() {
    try {
      await approvePayrollRun(params.school, params.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not approve this run.');
    }
  }

  async function handleMarkPaid(payslipId: string) {
    try {
      await markPayslipPaid(params.school, payslipId, referenceByPayslip[payslipId] || undefined);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not mark this payslip as paid.');
    }
  }

  async function handleDownload(payslipId: string) {
    const blob = await downloadPayslipPdf(params.school, payslipId);
    window.open(URL.createObjectURL(blob), '_blank');
  }

  async function handleDownloadSchedule() {
    try {
      const blob = await downloadDisbursementScheduleCsv(params.school, params.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disbursement-schedule-${run?.periodLabel.replace(/\s+/g, '-')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not generate the disbursement schedule.');
    }
  }

  if (isLoading) return <LoadingScreen />;
  if (!run) return <p className="p-6 text-sm text-red-600">{error ?? 'Not found.'}</p>;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{run.periodLabel}</h1>
            <p className="text-sm text-ink/60">
              {new Date(run.periodStart).toLocaleDateString(school.locale)} – {new Date(run.periodEnd).toLocaleDateString(school.locale)} ·{' '}
              {run.status}
            </p>
          </div>
          {run.status === 'DRAFT' && (
            <button onClick={handleApprove} className="flex items-center gap-1.5 rounded bg-ink px-4 py-1.5 text-sm text-white">
              <CheckCircle2 size={15} /> Approve run
            </button>
          )}
          {run.status !== 'DRAFT' && (
            <button onClick={handleDownloadSchedule} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm">
              <Landmark size={15} /> Download bank schedule (CSV)
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {run.status === 'DRAFT' && (
          <p className="text-sm text-amber-700">
            This run is a draft — staff can&apos;t see their payslips yet. Approve it once the numbers look right.
          </p>
        )}
        {missingBankDetails.length > 0 && (
          <p className="text-sm text-amber-700">
            {missingBankDetails.length} staff member(s) are missing bank details and won&apos;t appear on the bank schedule:{' '}
            {missingBankDetails.map((m) => m.fullName).join(', ')}. Add their bank details on the Staff page first.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-2">Staff</th>
                <th className="px-3 py-2">Gross</th>
                <th className="px-3 py-2">Deductions</th>
                <th className="px-3 py-2">Net</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(run.payslips ?? []).map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.user?.fullName}</div>
                    <div className="text-xs text-ink/50">{p.staffProfile?.staffId}</div>
                  </td>
                  <td className="px-3 py-2">{money(p.grossKobo, p.currency)}</td>
                  <td className="px-3 py-2">{money(p.deductionsKobo, p.currency)}</td>
                  <td className="px-3 py-2 font-medium">{money(p.netKobo, p.currency)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDownload(p.id)} className="text-ink/60 hover:text-ink" title="Download payslip">
                        <Download size={15} />
                      </button>
                      {p.status !== 'PAID' && run.status !== 'DRAFT' && (
                        <>
                          <input
                            className="w-32 rounded border px-1.5 py-1 text-xs"
                            placeholder="Payment ref."
                            value={referenceByPayslip[p.id] ?? ''}
                            onChange={(e) => setReferenceByPayslip({ ...referenceByPayslip, [p.id]: e.target.value })}
                          />
                          <button onClick={() => handleMarkPaid(p.id)} className="rounded bg-ink px-2 py-1 text-xs text-white">
                            Mark paid
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink/50">
          &ldquo;Mark paid&rdquo; records that you&apos;ve moved the money outside the platform (bank transfer, cash, etc.) and logs it as
          a Salaries expense in Accounting — it doesn&apos;t move any money itself. The bank schedule CSV lists everyone still owed
          money in this run with their bank details and net pay, ready to upload to your bank&apos;s own bulk-transfer tool — it
          doesn&apos;t send anything either.
        </p>
      </main>
    </RequireRole>
  );
}
