// web/app/[school]/admin/staff/id-cards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Contact, Check, X, Printer, User } from 'lucide-react';
import {
  listIdCardRequests,
  reviewIdCardRequest,
  listStaffProfiles,
  issueStaffIdCard,
  downloadStaffIdCardPdf,
  type IdCardRequest,
  type IdCardRequestStatus,
  type StaffProfile,
} from '@/lib/endpoints/staff';
import { ApiError } from '@/lib/api';
import { getSessionUser } from '@/lib/session';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};
const FILTERS: (IdCardRequestStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export default function AdminIdCardsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<IdCardRequest[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [filter, setFilter] = useState<IdCardRequestStatus | 'ALL'>('PENDING');
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const [r, s] = await Promise.all([listIdCardRequests(params.school, filter === 'ALL' ? undefined : filter), listStaffProfiles(params.school)]);
      setRequests(r);
      setStaff(s);
    } catch {
      setError('Could not load ID card requests.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function openPdf(staffProfileId: string) {
    const blob = await downloadStaffIdCardPdf(params.school, staffProfileId);
    window.open(URL.createObjectURL(blob), '_blank');
  }

  async function handleReview(r: IdCardRequest, approve: boolean, thenPrint = false) {
    setBusyId(r.id);
    setError(null);
    try {
      await reviewIdCardRequest(params.school, r.id, approve, noteById[r.id] || undefined);
      if (approve && thenPrint) await openPdf(r.staffProfileId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not review this request.');
    } finally {
      setBusyId(null);
    }
  }

  /** Admin printing on a staff member's behalf (no request needed): issues a card if there is none, then opens the PDF. */
  async function handlePrintFor(profile: StaffProfile) {
    setBusyId(profile.id);
    setError(null);
    try {
      try {
        await openPdf(profile.id);
      } catch {
        await issueStaffIdCard(params.school, profile.id);
        await openPdf(profile.id);
      }
    } catch {
      setError(`Could not print the ID card for ${profile.user.fullName}.`);
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold"><Contact size={20} /> Staff ID Cards</h1>
          <p className="text-sm text-ink/60">Approve staff requests, then print. Cards use the head of school&apos;s signature from Settings{school.name ? ` (${school.name})` : ''}.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs ${filter === f ? 'bg-ink text-white' : 'bg-black/5'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-lg border bg-white p-3 text-sm">
              <div className="flex items-center gap-3">
                {r.staffProfile?.photoUrl ? (
                  <img src={r.staffProfile.photoUrl} alt="" className="h-14 w-11 rounded border object-cover" />
                ) : (
                  <div className="flex h-14 w-11 items-center justify-center rounded border bg-black/5 text-ink/30"><User size={20} /></div>
                )}
                <div className="flex-1">
                  <Link href={`/${params.school}/admin/staff/${r.staffProfileId}`} className="font-medium underline">{r.staffProfile?.user.fullName}</Link>
                  <p className="text-xs text-ink/50">
                    {r.staffProfile?.staffId} · {r.staffProfile?.designation ?? 'Staff'} · requested {new Date(r.createdAt).toLocaleDateString(school.locale)}
                  </p>
                  {r.reason && <p className="text-xs text-ink/60">Reason: {r.reason}</p>}
                  {r.reviewNote && <p className="text-xs text-ink/50">Note: {r.reviewNote}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[r.status]}`}>{r.status}</span>
              </div>
              {!r.staffProfile?.photoUrl && r.status === 'PENDING' && (
                <p className="text-xs text-amber-700">No photo on file — the card will print with a blank photo. Add one on the staff profile first.</p>
              )}
              {r.status === 'PENDING' && r.staffProfile?.userId === getSessionUser()?.id && (
                <p className="text-xs text-amber-700">Your own request — another school admin must approve it.</p>
              )}
              {r.status === 'PENDING' && r.staffProfile?.userId !== getSessionUser()?.id && (
                <div className="flex flex-wrap items-center gap-2">
                  <input className="min-w-[10rem] flex-1 rounded border px-2 py-1 text-xs" placeholder="Note (optional)" value={noteById[r.id] ?? ''} onChange={(e) => setNoteById({ ...noteById, [r.id]: e.target.value })} />
                  <button disabled={busyId === r.id} onClick={() => handleReview(r, true)} className="flex items-center gap-1 rounded bg-green-600 px-2.5 py-1 text-xs text-white disabled:opacity-50"><Check size={13} /> Approve</button>
                  <button disabled={busyId === r.id} onClick={() => handleReview(r, true, true)} className="flex items-center gap-1 rounded bg-ink px-2.5 py-1 text-xs text-white disabled:opacity-50"><Printer size={13} /> Approve &amp; print</button>
                  <button disabled={busyId === r.id} onClick={() => handleReview(r, false)} className="flex items-center gap-1 rounded border px-2.5 py-1 text-xs text-red-600 disabled:opacity-50"><X size={13} /> Decline</button>
                </div>
              )}
              {r.status === 'APPROVED' && (
                <button onClick={() => openPdf(r.staffProfileId).catch(() => setError('Could not open this card.'))} className="flex w-fit items-center gap-1 rounded border px-2.5 py-1 text-xs"><Printer size={13} /> Print card</button>
              )}
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-ink/50">No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}requests.</p>}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="mb-1 text-sm font-medium">Print on behalf of a staff member</p>
          <p className="mb-3 text-xs text-ink/50">No request needed — this issues a card if none exists yet, then opens the printable PDF.</p>
          <div className="flex flex-col">
            {staff.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b py-1.5 text-sm last:border-0">
                <span>{p.user.fullName} <span className="text-xs text-ink/50">{p.staffId}{p.photoUrl ? '' : ' · no photo'}</span></span>
                <button disabled={busyId === p.id} onClick={() => handlePrintFor(p)} className="flex items-center gap-1 rounded border px-2.5 py-1 text-xs disabled:opacity-50"><Printer size={13} /> Print</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </RequireRole>
  );
}
