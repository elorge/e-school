// web/app/finance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { listPendingTransfers, resolveTransfer, type PendingTransfer } from '@/lib/endpoints/wallet-admin';
import { getSessionUser } from '@/lib/session';
import LoadingScreen from '@/components/LoadingScreen';
import { ApiError } from '@/lib/api';

export default function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
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
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">Finance &amp; Ops — Pending Transfers</h1>
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
    </main>
  );
}