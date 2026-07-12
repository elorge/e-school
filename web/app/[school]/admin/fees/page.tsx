// web/app/[school]/admin/fees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { listTerms } from '@/lib/endpoints/terms';
import { listClasses } from '@/lib/endpoints/classes';
import {
  createFeeStructure,
  listFeeStructures,
  generateInvoices,
  listInvoices,
  recordPayment,
  getDebtors,
  type FeeStructure,
  type FeeInvoice,
} from '@/lib/endpoints/fees';
import type { Term, Class } from '@/lib/types';

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

export default function FeesPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [termId, setTermId] = useState('');
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [debtors, setDebtors] = useState<{ student: any; outstandingKobo: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [structureForm, setStructureForm] = useState({ classId: '', name: '', amountKobo: 0 });

  useEffect(() => {
    Promise.all([listTerms(params.school), listClasses(params.school)]).then(([t, c]) => {
      setTerms(t);
      setClasses(c);
    }).finally(() => setIsLoading(false));
  }, [params.school]);

  useEffect(() => {
    if (!termId) return;
    listFeeStructures(params.school, termId).then(setStructures);
    listInvoices(params.school, termId).then(setInvoices);
    getDebtors(params.school, termId).then(setDebtors);
  }, [termId, params.school]);

  async function refresh() {
    if (!termId) return;
    setInvoices(await listInvoices(params.school, termId));
    setDebtors(await getDebtors(params.school, termId));
  }

  async function handleAddStructure(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createFeeStructure(params.school, { termId, ...structureForm, classId: structureForm.classId || undefined });
      setStructures(await listFeeStructures(params.school, termId));
      setStructureForm({ classId: '', name: '', amountKobo: 0 });
    } catch {
      setError('Could not add fee item');
    }
  }

  async function handleGenerate() {
    setError(null);
    setNotice(null);
    try {
      const result = await generateInvoices(params.school, termId);
      setNotice(`Generated ${result.created} new invoice(s).`);
      refresh();
    } catch {
      setError('Could not generate invoices');
    }
  }

  async function handleRecordPayment(invoiceId: string, amountStr: string, method: 'CASH' | 'BANK_TRANSFER' | 'CARD') {
    const amountKobo = Math.round(Number(amountStr) * 100);
    if (!amountKobo) return;
    await recordPayment(params.school, invoiceId, amountKobo, method);
    refresh();
  }

if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Fees</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <label className="flex w-fit flex-col gap-1 text-sm">
        Term
        <select className="rounded border px-2 py-1.5" value={termId} onChange={(e) => setTermId(e.target.value)}>
          <option value="">Select a term</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      {termId && (
        <>
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Fee structure for this term</h2>
            <ul className="mb-3 flex flex-col gap-1 text-sm">
              {structures.map((s) => (
                <li key={s.id}>
                  {s.name} {s.classId ? `(one class)` : '(all classes)'} — {naira(s.amountKobo)}
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddStructure} className="flex flex-wrap items-end gap-2">
              <input
                className="rounded border px-2 py-1.5 text-sm"
                placeholder="Fee name e.g. Tuition"
                value={structureForm.name}
                onChange={(e) => setStructureForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <select
                className="rounded border px-2 py-1.5 text-sm"
                value={structureForm.classId}
                onChange={(e) => setStructureForm((f) => ({ ...f, classId: e.target.value }))}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                className="w-32 rounded border px-2 py-1.5 text-sm"
                type="number"
                placeholder="Amount (₦)"
                onChange={(e) => setStructureForm((f) => ({ ...f, amountKobo: Math.round(Number(e.target.value) * 100) }))}
                required
              />
              <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
                Add
              </button>
            </form>
            <button onClick={handleGenerate} className="mt-4 rounded bg-brand-green px-3 py-1.5 text-sm text-white">
              Generate invoices for all active students this term
            </button>
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Invoices</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between border-b pb-2">
                  <span>
                    {inv.student?.firstName} {inv.student?.lastName} — {naira(inv.paidKobo)} / {naira(inv.totalKobo)} (
                    {inv.status})
                  </span>
                  {inv.status !== 'PAID' && (
                    <div className="flex items-center gap-2">
                      <input
                        className="w-24 rounded border px-2 py-1 text-xs"
                        type="number"
                        placeholder="₦ amount"
                        id={`pay-${inv.id}`}
                      />
                      <button
                        className="text-xs text-brand-blue underline"
                        onClick={() => {
                          const input = document.getElementById(`pay-${inv.id}`) as HTMLInputElement;
                          if (input?.value) handleRecordPayment(inv.id, input.value, 'CASH');
                          if (input) input.value = '';
                        }}
                      >
                        Record cash
                      </button>
                      <button
                        className="text-xs text-brand-blue underline"
                        onClick={() => {
                          const input = document.getElementById(`pay-${inv.id}`) as HTMLInputElement;
                          if (input?.value) handleRecordPayment(inv.id, input.value, 'BANK_TRANSFER');
                          if (input) input.value = '';
                        }}
                      >
                        Record transfer
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">Debtors</h2>
            {debtors.length === 0 && <p className="text-sm text-ink/50">No outstanding balances.</p>}
            <ul className="flex flex-col gap-1 text-sm">
              {debtors.map((d, i) => (
                <li key={i}>
                  {d.student.firstName} {d.student.lastName} — owes {naira(d.outstandingKobo)}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}