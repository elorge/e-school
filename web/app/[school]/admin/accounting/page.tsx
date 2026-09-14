// web/app/[school]/admin/accounting/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { Calculator } from 'lucide-react';
import { recordExpense, listExpenses, getSummary, downloadAccountingExcel, type ExpenseEntry, type IncomeExpenditureSummary } from '@/lib/endpoints/accounting';
import { accountingLabelsFor } from '@/lib/i18n/accounting-labels';
import RequireRole from '@/components/RequireRole';
import { Download } from 'lucide-react';
import { formatMoney, majorToMinor } from '@/lib/currency';

function firstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AccountingPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = accountingLabelsFor(school.locale);
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const [summary, setSummary] = useState<IncomeExpenditureSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ category: '', description: '', amountKobo: 0, incurredAt: today() });

  async function load() {
    try {
      setSummary(await getSummary(params.school, from, to));
      setExpenses(await listExpenses(params.school, from, to));
    } catch {
      setError(t.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await recordExpense(params.school, form);
      setForm({ category: '', description: '', amountKobo: 0, incurredAt: today() });
      load();
    } catch {
      setError(t.couldNotRecordExpense);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold"><Calculator size={20} />{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t.fromLabel}
          <input className="rounded border px-2 py-1.5" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t.toLabel}
          <input className="rounded border px-2 py-1.5" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {summary && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-xs text-ink/50">{t.incomeLabel}</p>
            <p className="text-xl font-semibold text-brand-green">{money(summary.totalIncomeKobo)}</p>
          </div>
          <div className="card">
            <p className="text-xs text-ink/50">{t.expensesLabel}</p>
            <p className="text-xl font-semibold text-red-600">{money(summary.totalExpenseKobo)}</p>
          </div>
          <div className="card">
            <p className="text-xs text-ink/50">{t.netLabel}</p>
            <p className={`text-xl font-semibold ${summary.netKobo >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
              {money(summary.netKobo)}
            </p>
          </div>
        </section>
      )}

      {summary && Object.keys(summary.expenseByCategory).length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-medium">{t.expensesByCategoryHeading}</h2>
          <ul className="text-sm">
            {Object.entries(summary.expenseByCategory).map(([cat, kobo]) => (
              <li key={cat}>
                {cat}: {money(kobo)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="mb-3 font-medium">{t.recordExpenseHeading}</h2>
        <form onSubmit={handleAddExpense} className="flex flex-wrap items-end gap-2">
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder={t.categoryPlaceholder}
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
          />
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder={t.descriptionPlaceholder}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
          <input
            className="w-32 rounded border px-2 py-1.5 text-sm"
            type="number"
            placeholder={t.amountPlaceholder(school.currency)}
            onChange={(e) => setForm((f) => ({ ...f, amountKobo: majorToMinor(Number(e.target.value), school.currency) }))}
            required
          />
          <input
            className="rounded border px-2 py-1.5 text-sm"
            type="date"
            value={form.incurredAt}
            onChange={(e) => setForm((f) => ({ ...f, incurredAt: e.target.value }))}
          />
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            {t.recordBtn}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">{t.recentExpensesHeading}</h2>
          <button
            onClick={async () => {
              const blob = await downloadAccountingExcel(params.school, from, to);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'accounting.xlsx';
              a.click();
            }}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <Download size={14} /> {t.exportToExcelBtn}
          </button>
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {expenses.map((e) => (
            <li key={e.id}>
              {e.incurredAt.slice(0, 10)} — {e.category}: {e.description} ({money(e.amountKobo)})
            </li>
          ))}
        </ul>
      </section>
    </main>
  </RequireRole>
);
}
