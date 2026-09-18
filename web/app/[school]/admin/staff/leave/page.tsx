// web/app/[school]/admin/staff/leave/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { CalendarClock, Plus } from 'lucide-react';
import { listLeaveTypes, createLeaveType, listLeaveRequests, reviewLeaveRequest, type LeaveType, type LeaveRequestRecord } from '@/lib/endpoints/leave';
import { ApiError } from '@/lib/api';

export default function AdminLeavePage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newType, setNewType] = useState({ name: '', defaultDaysPerYear: 0 });
  const [noteByRequest, setNoteByRequest] = useState<Record<string, string>>({});

  async function load() {
    try {
      const [t, r] = await Promise.all([listLeaveTypes(params.school), listLeaveRequests(params.school)]);
      setTypes(t);
      setRequests(r);
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

  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createLeaveType(params.school, newType);
      setNewType({ name: '', defaultDaysPerYear: 0 });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create this leave type.');
    }
  }

  async function handleReview(id: string, approve: boolean) {
    try {
      await reviewLeaveRequest(params.school, id, approve, noteByRequest[id]);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not review this request.');
    }
  }

  if (isLoading) return <LoadingScreen />;

  const pending = requests.filter((r) => r.status === 'PENDING');
  const reviewed = requests.filter((r) => r.status !== 'PENDING');

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <CalendarClock size={20} />
          {school.name} — Leave
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="flex flex-col gap-3 rounded-lg border bg-white p-4">
          <p className="text-sm font-medium">Leave types</p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <span key={t.id} className="rounded-full bg-black/5 px-3 py-1 text-xs">
                {t.name} — {t.defaultDaysPerYear} days/yr
              </span>
            ))}
            {types.length === 0 && <p className="text-sm text-ink/50">No leave types yet.</p>}
          </div>
          <form onSubmit={handleCreateType} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm">
              Name
              <input className="rounded border px-2 py-1.5" value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Default days/year
              <input
                type="number"
                min={0}
                className="w-28 rounded border px-2 py-1.5"
                value={newType.defaultDaysPerYear}
                onChange={(e) => setNewType({ ...newType, defaultDaysPerYear: Number(e.target.value) })}
              />
            </label>
            <button type="submit" className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-sm text-white">
              <Plus size={15} /> Add type
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium">Pending requests ({pending.length})</p>
          {pending.length === 0 && <p className="text-sm text-ink/50">Nothing waiting for review.</p>}
          {pending.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{r.staffProfile?.user.fullName}</p>
                  <p className="text-xs text-ink/50">
                    {r.leaveType?.name} · {new Date(r.startDate).toLocaleDateString(school.locale)} –{' '}
                    {new Date(r.endDate).toLocaleDateString(school.locale)} · {r.daysCount} day(s)
                  </p>
                  {r.reason && <p className="mt-1 text-sm text-ink/70">&ldquo;{r.reason}&rdquo;</p>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="w-40 rounded border px-2 py-1 text-xs"
                    placeholder="Note (optional)"
                    value={noteByRequest[r.id] ?? ''}
                    onChange={(e) => setNoteByRequest({ ...noteByRequest, [r.id]: e.target.value })}
                  />
                  <button onClick={() => handleReview(r.id, true)} className="rounded bg-green-600 px-3 py-1.5 text-xs text-white">
                    Approve
                  </button>
                  <button onClick={() => handleReview(r.id, false)} className="rounded bg-red-600 px-3 py-1.5 text-xs text-white">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium">History</p>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="px-3 py-2">Staff</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Dates</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.staffProfile?.user.fullName}</td>
                    <td className="px-3 py-2">{r.leaveType?.name}</td>
                    <td className="px-3 py-2">
                      {new Date(r.startDate).toLocaleDateString(school.locale)} – {new Date(r.endDate).toLocaleDateString(school.locale)}
                    </td>
                    <td className="px-3 py-2">{r.status}</td>
                  </tr>
                ))}
                {reviewed.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-ink/50">
                      No reviewed requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </RequireRole>
  );
}
