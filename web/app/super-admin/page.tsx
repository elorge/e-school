// web/app/super-admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  listSignupRequests,
  approveSignupRequest,
  rejectSignupRequest,
  setSessionWrapEnabled,
  listAllSchools,
  suspendSchool,
  reactivateSchool,
  createSchool,
  setPriceOverride,
  type SignupRequest,
} from '@/lib/endpoints/schools';
import { manualCredit } from '@/lib/endpoints/wallet-admin';
import { getSessionUser } from '@/lib/session';
import { SUPPORTED_COUNTRIES, currencyForCountry, formatMoney, majorToMinor, minorToMajor } from '@/lib/currency';
import LoadingScreen from '@/components/LoadingScreen';
import PlatformNav from '@/components/PlatformNav';
import { ApiError } from '@/lib/api';
import type { School } from '@/lib/types';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [priceOverride, setPriceOverrideInput] = useState('');

  const [newSchool, setNewSchool] = useState({
    slug: '',
    name: '',
    code: '',
    countryCode: '',
    adminEmail: '',
    adminName: '',
    adminPassword: '',
  });
  const newSchoolCurrency = newSchool.countryCode ? currencyForCountry(newSchool.countryCode) : null;

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'SUPER_ADMIN') {
      window.location.href = '/login';
      return;
    }
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [reqs, schoolList] = await Promise.all([listSignupRequests('PENDING'), listAllSchools()]);
      setRequests(reqs ?? []);
      setSchools(schoolList ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load platform data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setError(null);
    try {
      await approveSignupRequest(id);
      setNotice('School approved and activated.');
      loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not approve this request');
    }
  }

  async function handleReject(id: string) {
    setError(null);
    try {
      await rejectSignupRequest(id);
      loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reject this request');
    }
  }

  async function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!newSchoolCurrency) {
      setError('Please select a country.');
      return;
    }
    try {
      await createSchool({ ...newSchool, currency: newSchoolCurrency });
      setNotice(`${newSchool.name} created and live.`);
      setNewSchool({ slug: '', name: '', code: '', countryCode: '', adminEmail: '', adminName: '', adminPassword: '' });
      loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create school');
    }
  }

  function selectSchool(school: School) {
    setSelectedSchool(school);
    setPriceOverrideInput(
      school.pricePerStudentKoboOverride != null ? minorToMajor(school.pricePerStudentKoboOverride, school.currency).toString() : '',
    );
    setCreditAmount('');
    setCreditReason('');
  }

  async function handleToggleSessionWrap() {
    if (!selectedSchool) return;
    setError(null);
    try {
      const updated = await setSessionWrapEnabled(selectedSchool.slug, !selectedSchool.sessionWrapEnabled);
      setSelectedSchool(updated);
      setSchools((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      setNotice(`Session Wrap ${updated.sessionWrapEnabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this school');
    }
  }

  async function handleToggleSuspend() {
    if (!selectedSchool) return;
    setError(null);
    try {
      const updated =
        selectedSchool.status === 'ACTIVE'
          ? await suspendSchool(selectedSchool.slug)
          : await reactivateSchool(selectedSchool.slug);
      setSelectedSchool(updated);
      setSchools((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      setNotice(`${updated.name} is now ${updated.status}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update this school's status");
    }
  }

  async function handleSetPriceOverride() {
    if (!selectedSchool) return;
    setError(null);
    try {
      const kobo = priceOverride ? majorToMinor(Number(priceOverride), selectedSchool.currency) : null;
      const updated = await setPriceOverride(selectedSchool.slug, kobo);
      setSelectedSchool(updated);
      setSchools((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      setNotice('Price override updated.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update price override');
    }
  }

  async function handleManualCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchool) return;
    setError(null);
    try {
      const kobo = majorToMinor(Number(creditAmount), selectedSchool.currency);
      await manualCredit(selectedSchool.id, kobo, creditReason);
      setNotice(`Credited ${formatMoney(kobo, selectedSchool.currency)} to ${selectedSchool.name}.`);
      setCreditAmount('');
      setCreditReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not credit this school');
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <PlatformNav title="Elorge — Super Admin" />
      <div className="mx-auto max-w-4xl px-6 pt-4">
        <Link href="/super-admin/audit-log" className="text-sm text-brand-blue underline">View platform-wide audit log →</Link>
      </div>
      <main className="mx-auto max-w-4xl px-6 py-10">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {notice && <p className="mb-4 text-sm text-green-700">{notice}</p>}

        <section className="mb-10 card">
          <h2 className="mb-3 font-medium">Create a school directly</h2>
          <p className="mb-3 text-xs text-ink/50">Bypasses the signup-request queue — use for sales-assisted onboarding.</p>
          <form onSubmit={handleCreateSchool} className="grid gap-2 sm:grid-cols-2">
            <select
              className="rounded border px-2 py-1.5 text-sm"
              value={newSchool.countryCode}
              onChange={(e) => setNewSchool((f) => ({ ...f, countryCode: e.target.value }))}
              required
            >
              <option value="">Country</option>
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="School name"
              value={newSchool.name}
              onChange={(e) => setNewSchool((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="Workspace slug (greenwood-college)"
              value={newSchool.slug}
              onChange={(e) => setNewSchool((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm uppercase"
              placeholder="Code (GRW)"
              value={newSchool.code}
              onChange={(e) => setNewSchool((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="Admin full name"
              value={newSchool.adminName}
              onChange={(e) => setNewSchool((f) => ({ ...f, adminName: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              type="email"
              placeholder="Admin email"
              value={newSchool.adminEmail}
              onChange={(e) => setNewSchool((f) => ({ ...f, adminEmail: e.target.value }))}
              required
            />
            <input
              className="rounded border px-2 py-1.5 text-sm"
              type="password"
              placeholder="Admin temporary password"
              value={newSchool.adminPassword}
              onChange={(e) => setNewSchool((f) => ({ ...f, adminPassword: e.target.value }))}
              required
            />
            <button type="submit" className="w-fit rounded bg-brand-blue px-4 py-2 text-sm text-white sm:col-span-2">
              Create school
            </button>
          </form>
        </section>

        <section className="mb-10 card">
          <h2 className="mb-3 font-medium">Pending signup requests</h2>
          {requests.length === 0 && <p className="text-sm text-ink/50">No pending requests.</p>}
          <ul className="flex flex-col gap-2">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span>
                  {r.schoolName} — <span className="text-ink/50">{r.slug}</span>
                </span>
                <div className="flex gap-3">
                  <button className="text-green-700 underline" onClick={() => handleApprove(r.id)}>
                    Approve
                  </button>
                  <button className="text-red-600 underline" onClick={() => handleReject(r.id)}>
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1fr_1.3fr]">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">All schools</h2>
              <div className="flex gap-1 text-xs">
                {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`rounded-full px-2.5 py-1 ${statusFilter === f ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
                  >
                    {f === 'ALL' ? 'All' : f === 'ACTIVE' ? 'Active' : 'Suspended'}
                  </button>
                ))}
              </div>
            </div>
            <ul className="flex flex-col gap-1">
              {schools
                .filter((s) => statusFilter === 'ALL' || s.status === statusFilter)
                .map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => selectSchool(s)}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-black/5 ${
                      selectedSchool?.id === s.id ? 'bg-black/5' : ''
                    }`}
                  >
                    <span>
                      {s.name} <span className="text-xs text-ink/40">({s.countryCode} · {s.currency})</span>
                    </span>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{s.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            {!selectedSchool ? (
              <p className="text-sm text-ink/50">Select a school to manage it.</p>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-medium">{selectedSchool.name}</h2>
                  <p className="text-xs text-ink/50">{selectedSchool.slug} — {selectedSchool.countryCode} / {selectedSchool.currency}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>
                    Status: <strong className={selectedSchool.status === 'ACTIVE' ? 'text-brand-green' : 'text-red-600'}>{selectedSchool.status}</strong>
                  </span>
                  <button
                    onClick={handleToggleSuspend}
                    className={`rounded px-3 py-1.5 text-xs text-white ${selectedSchool.status === 'ACTIVE' ? 'bg-red-600' : 'bg-brand-green'}`}
                  >
                    {selectedSchool.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Session Wrap: <strong>{selectedSchool.sessionWrapEnabled ? 'ON' : 'OFF'}</strong></span>
                  <button onClick={handleToggleSessionWrap} className="rounded bg-brand-blue px-3 py-1.5 text-xs text-white">
                    Turn {selectedSchool.sessionWrapEnabled ? 'off' : 'on'}
                  </button>
                </div>

                <div>
                  <p className="mb-1 text-sm">Price per student override ({selectedSchool.currency}, blank = platform default)</p>
                  <div className="flex gap-2">
                    <input
                      className="w-32 rounded border px-2 py-1.5 text-sm"
                      type="number"
                      value={priceOverride}
                      onChange={(e) => setPriceOverrideInput(e.target.value)}
                    />
                    <button onClick={handleSetPriceOverride} className="rounded bg-brand-blue px-3 py-1.5 text-xs text-white">
                      Save
                    </button>
                  </div>
                </div>

                <form onSubmit={handleManualCredit} className="border-t pt-4">
                  <p className="mb-2 text-sm font-medium">Manual wallet credit</p>
                  <div className="flex flex-col gap-2">
                    <input
                      className="rounded border px-2 py-1.5 text-sm"
                      type="number"
                      placeholder={`Amount (${selectedSchool.currency})`}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      required
                    />
                    <input
                      className="rounded border px-2 py-1.5 text-sm"
                      placeholder="Reason (shown in the school's notification)"
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                    />
                    <button type="submit" className="w-fit rounded bg-brand-green px-3 py-1.5 text-xs text-white">
                      Credit wallet
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}