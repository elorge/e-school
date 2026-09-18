// web/app/[school]/staff/leave/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { CalendarClock, Send, X } from 'lucide-react';
import {
  listLeaveTypes,
  myLeaveBalances,
  myLeaveRequests,
  requestLeave,
  cancelLeaveRequest,
  type LeaveType,
  type LeaveBalance,
  type LeaveRequestRecord,
} from '@/lib/endpoints/leave';
import { ApiError } from '@/lib/api';

function today() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function MyLeavePage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: today(), endDate: today(), reason: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [t, b, r] = await Promise.all([listLeaveTypes(params.school), myLeaveBalances(params.school), myLeaveRequests(params.school)]);
      setTypes(t);
      setBalances(b);
      setRequests(r);
      if (!form.leaveTypeId && t.length > 0) setForm((f) => ({ ...f, leaveTypeId: t[0].id }));
    } catch {
      setError('Could not load leave data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestLeave(params.school, form);
      setForm({ ...form, reason: '' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit this leave request.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelLeaveRequest(params.school, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel this request.');
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['STAFF', 'SCHOOL_ADMIN']}>
      <main className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <CalendarClock size={20} />
          My Leave
        </h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          {balances.map((b) => {
            const type = types.find((t) => t.id === b.leaveTypeId);
            return (
              <span key={b.id} className="rounded-full bg-black/5 px-3 py-1 text-xs">
                {type?.name}: {b.daysAllotted - b.daysUsed} of {b.daysAllotted} days left
              </span>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border bg-white p-4">
          <p className="text-sm font-medium">Request leave</p>
          <label className="flex flex-col gap-1 text-sm">
            Type
            <select className="rounded border px-2 py-1.5" value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })} required>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Start
              <input type="date" className="rounded border px-2 py-1.5" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              End
              <input type="date" className="rounded border px-2 py-1.5" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Reason (optional)
            <textarea className="rounded border px-2 py-1.5" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </label>
          <button disabled={submitting || !form.leaveTypeId} type="submit" className="flex w-fit items-center gap-1.5 rounded bg-ink px-4 py-1.5 text-sm text-white disabled:opacity-50">
            <Send size={15} /> {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">My requests</p>
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm">
              <div>
                <p>
                  {r.leaveType?.name ?? types.find((t) => t.id === r.leaveTypeId)?.name} · {new Date(r.startDate).toLocaleDateString(school.locale)} –{' '}
                  {new Date(r.endDate).toLocaleDateString(school.locale)} ({r.daysCount}d)
                </p>
                {r.reviewNote && <p className="text-xs text-ink/50">Note: {r.reviewNote}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                {r.status === 'PENDING' && (
                  <button onClick={() => handleCancel(r.id)} className="text-red-600" title="Cancel">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-ink/50">No requests yet.</p>}
        </div>
      </main>
    </RequireRole>
  );
}
