// web/app/super-admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  listSignupRequests,
  approveSignupRequest,
  rejectSignupRequest,
  setSessionWrapEnabled,
  getSchoolBySlug,
  type SignupRequest,
} from '@/lib/endpoints/schools';
import { getSessionUser } from '@/lib/session';
import LoadingScreen from '@/components/LoadingScreen';
import { ApiError } from '@/lib/api';

export default function SuperAdminPage() {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [featureSlug, setFeatureSlug] = useState('');
  const [featureSchoolName, setFeatureSchoolName] = useState<string | null>(null);
  const [featureEnabled, setFeatureEnabled] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'SUPER_ADMIN') {
      window.location.href = '/login';
      return;
    }
    loadRequests();
  }, []);

async function loadRequests() {
    try {
      const data = await listSignupRequests('PENDING');
      setRequests(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load signup requests');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setError(null);
    try {
      await approveSignupRequest(id);
      setNotice('School approved and activated.');
      loadRequests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not approve this request');
    }
  }

  async function handleReject(id: string) {
    setError(null);
    try {
      await rejectSignupRequest(id);
      loadRequests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reject this request');
    }
  }

  async function handleLookupSchool() {
    setError(null);
    setFeatureSchoolName(null);
    try {
      const school = await getSchoolBySlug(featureSlug);
      if (!school) {
        setError('No school found with that workspace name');
        return;
      }
      setFeatureSchoolName(school.name);
      setFeatureEnabled(school.sessionWrapEnabled);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to look up school');
    }
  }

  async function handleToggleFeature() {
    setError(null);
    try {
      const updated = await setSessionWrapEnabled(featureSlug, !featureEnabled);
      setFeatureEnabled(updated.sessionWrapEnabled);
      setNotice(`Session Wrap ${updated.sessionWrapEnabled ? 'enabled' : 'disabled'} for ${updated.name}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this school');
    }
  }

if (isLoading) return <LoadingScreen />;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">Elorge — Super Admin</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {notice && <p className="mb-4 text-sm text-green-700">{notice}</p>}

      <section className="mb-10">
        <h2 className="mb-3 font-medium">Pending signup requests</h2>
        {(requests ?? []).length === 0 && <p className="text-sm text-ink/50">No pending requests.</p>}
        <ul className="flex flex-col gap-2">
          {(requests ?? []).map((r) => (
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

      <section>
        <h2 className="mb-3 font-medium">Session Wrap — per-school pilot toggle</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            School workspace name
            <input
              className="rounded border px-3 py-2"
              placeholder="greenwood-college"
              value={featureSlug}
              onChange={(e) => setFeatureSlug(e.target.value)}
            />
          </label>
          <button onClick={handleLookupSchool} className="rounded border px-3 py-2 text-sm">
            Look up
          </button>
        </div>
        {featureSchoolName && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span>
              {featureSchoolName} — Session Wrap is currently{' '}
              <strong>{featureEnabled ? 'ON' : 'OFF'}</strong>
            </span>
            <button onClick={handleToggleFeature} className="rounded bg-brand-blue px-3 py-1.5 text-white">
              Turn {featureEnabled ? 'off' : 'on'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}