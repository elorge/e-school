// web/app/[school]/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { getBalance, initializePayment } from '@/lib/endpoints/wallet';
import { listStaff, removeStaff } from '@/lib/endpoints/users';
import { ApiError } from '@/lib/api';
import type { User } from '@/lib/types';

export default function SchoolAdminPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [balanceKobo, setBalanceKobo] = useState<number | null>(null);
  const [staff, setStaff] = useState<User[]>([]);
  const [fundAmount, setFundAmount] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reassignPromptFor, setReassignPromptFor] = useState<string | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState('');

  async function loadData() {
    try {
      const [balance, staffList] = await Promise.all([getBalance(params.school), listStaff(params.school)]);
      setBalanceKobo(balance.balanceKobo);
      setStaff(staffList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFundWallet(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const amountKobo = Math.round(Number(fundAmount) * 100);
      const { redirectUrl } = await initializePayment(params.school, {
        amountKobo,
        provider: 'paystack',
        payerEmail,
      });
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start payment');
    }
  }

  async function handleRemoveStaff(userId: string, reassignToStaffId?: string) {
    setError(null);
    try {
      await removeStaff(params.school, userId, reassignToStaffId);
      setReassignPromptFor(null);
      setReassignTargetId('');
      loadData();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setReassignPromptFor(userId);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not remove staff member');
      }
    }
  }

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Admin</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="mb-2 font-medium">Wallet</h2>
        <p className="mb-3 text-2xl">
          {balanceKobo === null ? 'Loading…' : `₦${(balanceKobo / 100).toLocaleString('en-NG')}`}
        </p>
        <form onSubmit={handleFundWallet} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Amount (₦)
            <input
              className="rounded border px-2 py-1"
              type="number"
              min="1"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Payer email
            <input
              className="rounded border px-2 py-1"
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="rounded bg-blue-700 px-3 py-1.5 text-white">
            Fund via Paystack
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-medium">Staff</h2>
        <ul className="flex flex-col gap-2">
          {staff.map((member) => (
            <li key={member.id} className="flex items-center justify-between rounded border px-3 py-2">
              <span>
                {member.fullName} — {member.email} ({member.role})
              </span>
              {reassignPromptFor === member.id ? (
                <div className="flex items-center gap-2">
                  <select
                    className="rounded border px-2 py-1 text-sm"
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                  >
                    <option value="">Reassign their classes/students to…</option>
                    {staff
                      .filter((s) => s.id !== member.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName}
                        </option>
                      ))}
                  </select>
                  <button
                    className="text-sm text-red-600 underline"
                    disabled={!reassignTargetId}
                    onClick={() => handleRemoveStaff(member.id, reassignTargetId)}
                  >
                    Confirm removal
                  </button>
                </div>
              ) : (
                <button className="text-sm text-red-600 underline" onClick={() => handleRemoveStaff(member.id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}