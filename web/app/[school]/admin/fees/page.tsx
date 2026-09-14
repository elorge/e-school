// web/app/[school]/admin/fees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { Wallet } from 'lucide-react';
import { listTerms } from '@/lib/endpoints/terms';
import { listClasses } from '@/lib/endpoints/classes';
import {
  createFeeStructure,
  listFeeStructures,
  generateInvoices,
  listInvoices,
  recordPayment,
  getDebtors,
  downloadInvoicesExcel,
  type FeeStructure,
  type FeeInvoice,
} from '@/lib/endpoints/fees';
import { feesLabelsFor } from '@/lib/i18n/fees-labels';
import type { Term, Class } from '@/lib/types';
import RequireRole from '@/components/RequireRole';
import { Download } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatMoney, majorToMinor } from '@/lib/currency';

function statusLabel(status: FeeInvoice['status'], t: ReturnType<typeof feesLabelsFor>): string {
  if (status === 'PAID') return t.statusPaid;
  if (status === 'PARTIALLY_PAID') return t.statusPartiallyPaid;
  return t.statusPending;
}

export default function FeesPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = feesLabelsFor(school.locale);
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
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

  const [narration, setNarration] = useState('');
  const [matchAmount, setMatchAmount] = useState('');
  const [matches, setMatches] = useState<{ invoiceId: string; studentName: string; admissionId: string | null; outstandingKobo: number; confidence: number }[]>([]);

  async function handleMatch() {
    const result = await apiFetch(`/${params.school}/fees/match-payment`, {
      method: 'POST',
      body: JSON.stringify({ narration, amountKobo: matchAmount ? majorToMinor(Number(matchAmount), school.currency) : undefined }),
    });
    setMatches(result as any);
  }

  useEffect(() => {
    Promise.all([listTerms(params.school), listClasses(params.school)]).then(([terms, c]) => {
      setTerms(terms);
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
      setError(t.couldNotAddFeeItem);
    }
  }

  async function handleGenerate() {
    setError(null);
    setNotice(null);
    try {
      const result = await generateInvoices(params.school, termId);
      setNotice(t.invoicesGeneratedNotice(result.created));
      refresh();
    } catch {
      setError(t.couldNotGenerateInvoices);
    }
  }

  async function handleRecordPayment(invoiceId: string, amountStr: string, method: 'CASH' | 'BANK_TRANSFER' | 'CARD') {
    const amountKobo = majorToMinor(Number(amountStr), school.currency);
    if (!amountKobo) return;
    await recordPayment(params.school, invoiceId, amountKobo, method);
    refresh();
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold"><Wallet size={20} /> {school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <label className="flex w-fit flex-col gap-1 text-sm">
        {t.termLabel}
        <select className="rounded border px-2 py-1.5" value={termId} onChange={(e) => setTermId(e.target.value)}>
          <option value="">{t.selectTerm}</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </label>

      {termId && (
        <>
          <section className="card">
            <h2 className="mb-3 font-medium">{t.feeStructureHeadingGeneric}</h2>
            <ul className="mb-3 flex flex-col gap-1 text-sm">
              {structures.map((s) => (
                <li key={s.id}>
                  {s.name} {s.classId ? t.oneClass : t.allClasses} — {money(s.amountKobo)}
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddStructure} className="flex flex-wrap items-end gap-2">
              <input
                className="rounded border px-2 py-1.5 text-sm"
                placeholder={t.feeNamePlaceholder}
                value={structureForm.name}
                onChange={(e) => setStructureForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <select
                className="rounded border px-2 py-1.5 text-sm"
                value={structureForm.classId}
                onChange={(e) => setStructureForm((f) => ({ ...f, classId: e.target.value }))}
              >
                <option value="">{t.allClasses}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                className="w-32 rounded border px-2 py-1.5 text-sm"
                type="number"
                placeholder={t.amountPlaceholder(school.currency)}
                onChange={(e) => setStructureForm((f) => ({ ...f, amountKobo: majorToMinor(Number(e.target.value), school.currency) }))}
                required
              />
              <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
                {t.addBtn}
              </button>
            </form>
            <button onClick={handleGenerate} className="mt-4 rounded bg-brand-green px-3 py-1.5 text-sm text-white">
              {t.generateInvoicesBtn}
            </button>
          </section>

          <section className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">{t.invoicesHeading(invoices.length)}</h2>
              <button
                onClick={async () => {
                  const blob = await downloadInvoicesExcel(params.school, termId);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'fee-invoices.xlsx';
                  a.click();
                }}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Download size={14} /> {t.exportToExcelBtn}
              </button>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between border-b pb-2">
                  <span className="flex items-center gap-2">
                    {inv.student?.firstName} {inv.student?.lastName} — {money(inv.paidKobo)} / {money(inv.totalKobo)}
                    <span
                      className={`badge ${inv.status === 'PAID' ? 'badge-green' : inv.status === 'PARTIALLY_PAID' ? 'badge-amber' : 'badge-red'}`}
                    >
                      {statusLabel(inv.status, t)}
                    </span>
                  </span>
                  {inv.status !== 'PAID' && (
                    <div className="flex items-center gap-2">
                      <input
                        className="w-24 rounded border px-2 py-1 text-xs"
                        type="number"
                        placeholder={t.cashAmountPlaceholder(school.currency)}
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
                        {t.recordCashBtn}
                      </button>
                      <button
                        className="text-xs text-brand-blue underline"
                        onClick={() => {
                          const input = document.getElementById(`pay-${inv.id}`) as HTMLInputElement;
                          if (input?.value) handleRecordPayment(inv.id, input.value, 'BANK_TRANSFER');
                          if (input) input.value = '';
                        }}
                      >
                        {t.recordTransferBtn}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2 className="mb-3 font-medium">{t.matchTransferHeading}</h2>
            <p className="mb-3 text-xs text-ink/50">{t.matchTransferHelp}</p>
            <div className="flex flex-wrap gap-2">
              <input className="flex-1 rounded border px-2 py-1.5 text-sm" placeholder={t.narrationPlaceholder} value={narration} onChange={(e) => setNarration(e.target.value)} />
              <input className="w-32 rounded border px-2 py-1.5 text-sm" type="number" placeholder={t.amountPlaceholder(school.currency)} value={matchAmount} onChange={(e) => setMatchAmount(e.target.value)} />
              <button onClick={handleMatch} className="btn-primary text-sm">{t.findMatchesBtn}</button>
            </div>
            {matches.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1">
                {matches.map((m) => (
                  <li key={m.invoiceId} className="flex items-center justify-between rounded bg-black/5 px-3 py-2 text-sm">
                    <span>{m.studentName} — {t.owes(money(m.outstandingKobo))}</span>
                    <span className="badge badge-blue">{t.matchPercent(m.confidence)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 font-medium">{t.debtorsHeading}</h2>
            {debtors.length === 0 && <p className="text-sm text-ink/50">{t.noOutstandingBalances}</p>}
            <ul className="flex flex-col gap-1 text-sm">
              {debtors.map((d, i) => (
                <li key={i}>
                  {d.student.firstName} {d.student.lastName} — {t.owes(money(d.outstandingKobo))}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  </RequireRole>
);
}
