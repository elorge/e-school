// web/components/PayslipBreakdown.tsx
'use client';

import { formatMoney } from '@/lib/currency';
import type { Payslip } from '@/lib/endpoints/payroll';

/** Itemised earnings → deductions → net for one payslip, so every deduction is visible by name, not just a lump total. */
export default function PayslipBreakdown({ payslip, locale }: { payslip: Payslip; locale: string }) {
  const money = (kobo: number) => formatMoney(kobo, payslip.currency, locale);
  const allowances = payslip.breakdown?.allowances ?? [];
  const deductions = payslip.breakdown?.deductions ?? [];

  const Row = ({ label, value, strong, negative }: { label: string; value: string; strong?: boolean; negative?: boolean }) => (
    <div className={`flex justify-between py-0.5 ${strong ? 'border-t pt-1.5 font-medium' : ''}`}>
      <span className="text-ink/70">{label}</span>
      <span className={negative ? 'text-red-600' : ''}>{negative ? '−' : ''}{value}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-lg bg-black/[0.03] p-3 text-sm sm:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Earnings</p>
        <Row label="Base salary" value={money(payslip.baseSalaryKobo)} />
        {allowances.map((a, i) => (
          <Row key={i} label={a.name || 'Allowance'} value={money(a.amountKobo)} />
        ))}
        <Row label="Gross pay" value={money(payslip.grossKobo)} strong />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Deductions</p>
        {deductions.length === 0 ? (
          <p className="py-0.5 text-ink/50">No deductions this period.</p>
        ) : (
          deductions.map((d, i) => <Row key={i} label={d.name || 'Deduction'} value={money(d.amountKobo)} negative />)
        )}
        <Row label="Total deductions" value={money(payslip.deductionsKobo)} strong negative={deductions.length > 0} />
        <Row label="Net pay" value={money(payslip.netKobo)} strong />
      </div>
    </div>
  );
}
