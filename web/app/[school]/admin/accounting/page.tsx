// web/app/[school]/admin/accounting/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { recordExpense, listExpenses, getSummary, type ExpenseEntry, type IncomeExpenditureSummary } from '@/lib/endpoints/accounting';

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

function firstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AccountingPage({ params }: { params: { school: string } }) {
  const school = useSchool();
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
      setError('Failed to load accounting data');
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
      setError('Could not record expense');
    }
  }

if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Accounting</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          From
          <input className="rounded border px-2 py-1.5" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          To
          <input className="rounded border px-2 py-1.5" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {summary && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-ink/50">Income (fee payments)</p>
            <p className="text-xl font-semibold text-brand-green">{naira(summary.totalIncomeKobo)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-ink/50">Expenses</p>
            <p className="text-xl font-semibold text-red-600">{naira(summary.totalExpenseKobo)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-ink/50">Net</p>
            <p className={`text-xl font-semibold ${summary.netKobo >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
              {naira(summary.netKobo)}
            </p>
          </div>
        </section>
      )}

      {summary && Object.keys(summary.expenseByCategory).length > 0 && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Expenses by category</h2>
          <ul className="text-sm">
            {Object.entries(summary.expenseByCategory).map(([cat, kobo]) => (
              <li key={cat}>
                {cat}: {naira(kobo)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Record an expense</h2>
        <form onSubmit={handleAddExpense} className="flex flex-wrap items-end gap-2">
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder="Category e.g. Salaries"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
          />
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
          <input
            className="w-32 rounded border px-2 py-1.5 text-sm"
            type="number"
            placeholder="Amount (₦)"
            onChange={(e) => setForm((f) => ({ ...f, amountKobo: Math.round(Number(e.target.value) * 100) }))}
            required
          />
          <input
            className="rounded border px-2 py-1.5 text-sm"
            type="date"
            value={form.incurredAt}
            onChange={(e) => setForm((f) => ({ ...f, incurredAt: e.target.value }))}
          />
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            Record
          </button>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Recent expenses</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {expenses.map((e) => (
            <li key={e.id}>
              {e.incurredAt.slice(0, 10)} — {e.category}: {e.description} ({naira(e.amountKobo)})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}