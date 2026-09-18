// web/app/[school]/staff/payroll/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Wallet, Download } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { listMyPayslips, downloadPayslipPdf, type Payslip } from '@/lib/endpoints/payroll';

export default function MyPayslipsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPayslips(await listMyPayslips(params.school));
      } catch {
        setError('Could not load your payslips.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.school]);

  async function handleDownload(id: string) {
    const blob = await downloadPayslipPdf(params.school, id);
    window.open(URL.createObjectURL(blob), '_blank');
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['STAFF', 'SCHOOL_ADMIN']}>
      <main className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Wallet size={20} />
          My Payslips
        </h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-2">
          {payslips
            .filter((p) => p.payrollRun?.status !== 'DRAFT')
            .map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
                <div>
                  <p className="font-medium">{p.payrollRun?.periodLabel}</p>
                  <p className="text-sm text-ink/60">
                    Net: {formatMoney(p.netKobo, p.currency, school.locale)} · {p.status === 'PAID' ? `Paid ${new Date(p.paidAt!).toLocaleDateString(school.locale)}` : 'Pending payment'}
                  </p>
                </div>
                <button onClick={() => handleDownload(p.id)} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm">
                  <Download size={15} /> Download
                </button>
              </div>
            ))}
          {payslips.length === 0 && <p className="text-sm text-ink/50">No payslips yet.</p>}
        </div>
      </main>
    </RequireRole>
  );
}
