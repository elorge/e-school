// web/app/finance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { listPendingTransfers, resolveTransfer, manualCredit, type PendingTransfer } from '@/lib/endpoints/wallet-admin';
import { getOverview, recordPlatformExpense, downloadExpensesExcel, type PlatformOverview } from '@/lib/endpoints/platform-finance';
import { Download } from 'lucide-react';
import { getSessionUser } from '@/lib/session';
import SchoolSearchInput from '@/components/SchoolSearchInput';
import LoadingScreen from '@/components/LoadingScreen';
import PlatformNav from '@/components/PlatformNav';
import { ApiError } from '@/lib/api';

export default function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [creditSchoolName, setCreditSchoolName] = useState<string | null>(null);
  const [creditSchoolId, setCreditSchoolId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', amount: '', incurredAt: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'FINANCE_OPS' && user.role !== 'SUPER_ADMIN') {
      window.location.href = '/login';
      return;
    }
    load();
  }, []);

async function load() {
    try {
      const [t, o] = await Promise.all([listPendingTransfers(), getOverview()]);
      setTransfers(t);
      setOverview(o);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load finance data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecordExpense(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const amountKobo = Math.round(Number(expenseForm.amount) * 100);
      if (!amountKobo || amountKobo <= 0) {
        setError('Enter a valid amount greater than zero.');
        return;
      }
      await recordPlatformExpense({
        category: expenseForm.category,
        description: expenseForm.description,
        amountKobo,
        incurredAt: expenseForm.incurredAt,
      });
      setExpenseForm({ category: '', description: '', amount: '', incurredAt: new Date().toISOString().slice(0, 10) });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record expense — check the browser console for details');
      console.error('Record expense failed:', err);
    }
  }

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!creditSchoolId) return;
    setError(null);
    try {
      const kobo = Math.round(Number(creditAmount) * 100);
      await manualCredit(creditSchoolId, kobo, creditReason);
      setCreditAmount('');
      setCreditReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not credit this school');
    }
  }

  async function handleResolve(id: string, approve: boolean) {
    setError(null);
    try {
      await resolveTransfer(id, approve);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resolve this transfer');
    }
  }

if (isLoading) return <LoadingScreen />;

  return (
    <>
      <PlatformNav title="Elorge — Finance & Ops" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        {overview && (
          <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="stat-hero">
              <p className="text-xs text-white/60">Revenue (this month)</p>
              <p className="font-display text-xl font-semibold">₦{(overview.revenueThisMonthKobo / 100).toLocaleString('en-NG')}</p>
            </div>
            <div className="card">
              <p className="text-xs text-ink/50">Platform expenses</p>
              <p className="font-display text-xl font-semibold text-red-600">₦{(overview.expensesThisMonthKobo / 100).toLocaleString('en-NG')}</p>
            </div>
            <div className="card">
              <p className="text-xs text-ink/50">Net (this month)</p>
              <p className={`font-display text-xl font-semibold ${overview.netThisMonthKobo >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                ₦{(overview.netThisMonthKobo / 100).toLocaleString('en-NG')}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-ink/50">Schools</p>
              <p className="font-display text-xl font-semibold">
                {overview.activeSchools} active <span className="text-sm text-red-600">/ {overview.suspendedSchools} suspended</span>
              </p>
            </div>
          </section>
        )}

        <section className="card mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Record a platform expense</h2>
            <button
              onClick={async () => {
                const blob = await downloadExpensesExcel();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'platform-expenses.xlsx';
                a.click();
              }}
              className="btn-secondary flex items-center gap-1.5 text-xs"
            >
              <Download size={14} /> Export to Excel
            </button>
          </div>
          <p className="mb-3 text-xs text-ink/50">Elorge's own operating costs — salaries, hosting, tools — separate from any school's wallet.</p>
          <form onSubmit={handleRecordExpense} className="flex flex-wrap items-end gap-2">
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="Category (e.g. Salaries)"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="Description"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
            <input
              className="w-28 rounded border px-2 py-1.5 text-sm"
              type="number"
              placeholder="Amount (₦)"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              type="date"
              value={expenseForm.incurredAt}
              onChange={(e) => setExpenseForm((f) => ({ ...f, incurredAt: e.target.value }))}
              required
            />
            <button type="submit" className="btn-primary">
              Record
            </button>
          </form>
        </section>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {transfers.length === 0 && <p className="text-sm text-ink/50">Nothing pending.</p>}
      <ul className="flex flex-col gap-2">
        {transfers.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>
              {t.school.name} — ₦{(t.amountKobo / 100).toLocaleString('en-NG')} — <span className="text-ink/50">{t.reference}</span>
            </span>
            <div className="flex gap-3">
              <button className="text-green-700 underline" onClick={() => handleResolve(t.id, true)}>
                Approve
              </button>
              <button className="text-red-600 underline" onClick={() => handleResolve(t.id, false)}>
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-10 card">
        <h2 className="mb-3 font-medium">Manual wallet credit</h2>
        <div className="mb-3">
          <SchoolSearchInput
            onSelect={(school) => {
              setCreditSchoolName(school.name);
              setCreditSchoolId(school.id);
              setError(null);
            }}
            onError={setError}
          />
        </div>
        {creditSchoolName && (
          <form onSubmit={handleCredit} className="flex flex-col gap-2">
            <p className="text-sm">
              Crediting: <strong>{creditSchoolName}</strong>
            </p>
            <input
              className="rounded border px-2 py-1.5 text-sm"
              type="number"
              placeholder="Amount (₦)"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="Reason"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
            />
            <button type="submit" className="w-fit rounded bg-brand-green px-3 py-1.5 text-sm text-white">
              Credit wallet
            </button>
          </form>
        )}
      </section>
      </main>
    </>
  );
}