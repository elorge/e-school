// web/app/finance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { listPendingTransfers, resolveTransfer, manualCredit, type PendingTransfer } from '@/lib/endpoints/wallet-admin';
import { getSchoolBySlug } from '@/lib/endpoints/schools';
import { getSessionUser } from '@/lib/session';
import LoadingScreen from '@/components/LoadingScreen';
import PlatformNav from '@/components/PlatformNav';
import { ApiError } from '@/lib/api';

export default function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [creditSlug, setCreditSlug] = useState('');
  const [creditSchoolName, setCreditSchoolName] = useState<string | null>(null);
  const [creditSchoolId, setCreditSchoolId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
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
      setTransfers(await listPendingTransfers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load pending transfers');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLookupSchool() {
    setError(null);
    setCreditSchoolName(null);
    try {
      const school = await getSchoolBySlug(creditSlug);
      if (!school) {
        setError('No school found with that workspace name');
        return;
      }
      setCreditSchoolName(school.name);
      setCreditSchoolId(school.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to look up school');
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
      <main className="mx-auto max-w-2xl px-6 py-10">
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
        <div className="mb-3 flex items-end gap-2">
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder="School workspace name"
            value={creditSlug}
            onChange={(e) => setCreditSlug(e.target.value)}
          />
          <button onClick={handleLookupSchool} className="rounded border px-3 py-1.5 text-sm">
            Look up
          </button>
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