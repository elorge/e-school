// web/app/[school]/staff/me/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import StaffPhotoEditor from '@/components/StaffPhotoEditor';
import { Contact, Pencil, Printer, Send, X } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import {
  getMyStaffProfile,
  downloadStaffIdCardPdf,
  listStaffAttendance,
  getMyIdCardStatus,
  updateMyStaffProfile,
  type UpdateMyStaffProfileBody,
  requestStaffIdCard,
  cancelStaffIdCardRequest,
  type StaffProfile,
  type StaffAttendanceRecord,
  type MyIdCardStatus,
} from '@/lib/endpoints/staff';
import { ApiError } from '@/lib/api';

type DetailsForm = Required<UpdateMyStaffProfileBody>;

function toForm(p: StaffProfile): DetailsForm {
  return {
    phone: p.phone ?? '',
    address: p.address ?? '',
    gender: p.gender ?? '',
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
    maritalStatus: p.maritalStatus ?? '',
    stateOfOrigin: p.stateOfOrigin ?? '',
    qualifications: p.qualifications ?? '',
    nextOfKinName: p.nextOfKinName ?? '',
    nextOfKinPhone: p.nextOfKinPhone ?? '',
    nextOfKinRelationship: p.nextOfKinRelationship ?? '',
    bankName: p.bankName ?? '',
    bankAccountName: p.bankAccountName ?? '',
    bankAccountNumber: p.bankAccountNumber ?? '',
  };
}

const REQUEST_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function MyStaffProfilePage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [attendance, setAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [cardStatus, setCardStatus] = useState<MyIdCardStatus | null>(null);
  const [reason, setReason] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DetailsForm | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCardStatus = useCallback(async () => {
    try {
      setCardStatus(await getMyIdCardStatus(params.school));
    } catch {
      /* card section just stays hidden if this fails */
    }
  }, [params.school]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyStaffProfile(params.school);
        setProfile(p);
        setAttendance(await listStaffAttendance(params.school, p.id));
        await loadCardStatus();
      } catch (err) {
        setError('Could not load your profile.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.school, loadCardStatus]);

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateMyStaffProfile(params.school, form);
      setProfile(updated);
      setEditing(false);
      setNotice('Your details were saved. Your school admin can see them.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your details.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePrintCard() {
    if (!profile) return;
    setError(null);
    try {
      const blob = await downloadStaffIdCardPdf(params.school, profile.id);
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      setError('Your ID card is not available yet — request one below and wait for approval.');
    }
  }

  async function handleRequestCard(e: React.FormEvent) {
    e.preventDefault();
    setRequesting(true);
    setError(null);
    setNotice(null);
    try {
      await requestStaffIdCard(params.school, reason || undefined);
      setReason('');
      setNotice('Request sent — you will be notified when it is approved.');
      loadCardStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your ID card request.');
    } finally {
      setRequesting(false);
    }
  }

  async function handleCancelRequest(id: string) {
    try {
      await cancelStaffIdCardRequest(params.school, id);
      loadCardStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel this request.');
    }
  }

  if (isLoading) return <LoadingScreen />;

  const allowances = profile?.allowances ?? [];
  const deductions = profile?.deductions ?? [];
  const allowancesTotal = allowances.reduce((s, a) => s + a.amountKobo, 0);
  const deductionsTotal = deductions.reduce((s, d) => s + d.amountKobo, 0);
  const hasPending = cardStatus?.requests.some((r) => r.status === 'PENDING') ?? false;

  return (
    <RequireRole allow={['STAFF', 'SCHOOL_ADMIN']}>
      <main className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-xl font-semibold">My Info</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        {profile && (
          <>
            <div className="flex flex-col gap-4 rounded-lg border bg-white p-4">
              <StaffPhotoEditor
                school={params.school}
                staffProfileId={profile.id}
                photoUrl={profile.photoUrl}
                onChanged={(url) => {
                  setProfile({ ...profile, photoUrl: url });
                  loadCardStatus();
                }}
              />
              <div>
                <p className="text-lg font-medium">{profile.user.fullName}</p>
                <p className="text-sm text-ink/60">
                  {profile.staffId} · {profile.designation ?? 'Staff'} {profile.department ? `· ${profile.department}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">My details</p>
                {!editing && (
                  <button
                    onClick={() => {
                      setForm(toForm(profile));
                      setEditing(true);
                      setNotice(null);
                    }}
                    className="flex items-center gap-1.5 rounded border px-3 py-1.5"
                  >
                    <Pencil size={14} /> Edit details
                  </button>
                )}
              </div>

              {!editing || !form ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <p><span className="text-ink/50">Email:</span> {profile.user.email}</p>
                  <p><span className="text-ink/50">Phone:</span> {profile.phone ?? '—'}</p>
                  <p><span className="text-ink/50">Employment status:</span> {profile.employmentStatus.replace('_', ' ')}</p>
                  <p><span className="text-ink/50">Employment type:</span> {profile.employmentType.replace('_', ' ')}</p>
                  <p><span className="text-ink/50">Gender:</span> {profile.gender ?? '—'}</p>
                  <p><span className="text-ink/50">Date of birth:</span> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString(school.locale) : '—'}</p>
                  <p><span className="text-ink/50">Marital status:</span> {profile.maritalStatus ?? '—'}</p>
                  <p><span className="text-ink/50">State of origin:</span> {profile.stateOfOrigin ?? '—'}</p>
                  <p className="sm:col-span-2"><span className="text-ink/50">Address:</span> {profile.address ?? '—'}</p>
                  <p className="sm:col-span-2"><span className="text-ink/50">Qualifications:</span> {profile.qualifications ?? '—'}</p>
                  <p className="sm:col-span-2">
                    <span className="text-ink/50">Next of kin:</span> {profile.nextOfKinName ?? '—'}
                    {profile.nextOfKinRelationship ? ` (${profile.nextOfKinRelationship})` : ''}
                    {profile.nextOfKinPhone ? ` · ${profile.nextOfKinPhone}` : ''}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-ink/50">Bank:</span>{' '}
                    {profile.bankName ? `${profile.bankName} · ${profile.bankAccountName ?? ''} · ${profile.bankAccountNumber ?? ''}` : '—'}
                  </p>
                  {!(profile.bankName && profile.bankAccountNumber) && (
                    <p className="text-amber-700 sm:col-span-2">Add your bank details so payroll knows where to pay your salary.</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveDetails} className="flex flex-col gap-4">
                  <p className="text-xs text-ink/50">Job title, department, status and pay are managed by your school admin. Everything below is yours to fill in.</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">Phone
                      <input className="rounded border px-2 py-1.5" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1">Gender
                      <select className="rounded border px-2 py-1.5" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="">—</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">Date of birth
                      <input type="date" className="rounded border px-2 py-1.5" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1">Marital status
                      <select className="rounded border px-2 py-1.5" value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}>
                        <option value="">—</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">State of origin
                      <input className="rounded border px-2 py-1.5" value={form.stateOfOrigin} onChange={(e) => setForm({ ...form, stateOfOrigin: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1">Home address
                      <input className="rounded border px-2 py-1.5" maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">Qualifications
                      <textarea className="rounded border px-2 py-1.5" rows={2} maxLength={500} placeholder="e.g. B.Ed Mathematics, TRCN registered" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Next of kin</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className="flex flex-col gap-1">Name
                        <input className="rounded border px-2 py-1.5" value={form.nextOfKinName} onChange={(e) => setForm({ ...form, nextOfKinName: e.target.value })} />
                      </label>
                      <label className="flex flex-col gap-1">Relationship
                        <input className="rounded border px-2 py-1.5" placeholder="e.g. Spouse, Parent" value={form.nextOfKinRelationship} onChange={(e) => setForm({ ...form, nextOfKinRelationship: e.target.value })} />
                      </label>
                      <label className="flex flex-col gap-1">Phone
                        <input className="rounded border px-2 py-1.5" inputMode="tel" value={form.nextOfKinPhone} onChange={(e) => setForm({ ...form, nextOfKinPhone: e.target.value })} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Bank details (for salary)</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className="flex flex-col gap-1">Bank name
                        <input className="rounded border px-2 py-1.5" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                      </label>
                      <label className="flex flex-col gap-1">Account name
                        <input className="rounded border px-2 py-1.5" value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} />
                      </label>
                      <label className="flex flex-col gap-1">Account number
                        <input className="rounded border px-2 py-1.5" inputMode="numeric" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value.replace(/\D/g, '') })} />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-ink/50">Your school admin is notified when bank details change.</p>
                  </div>

                  <div className="flex gap-2">
                    <button disabled={saving} type="submit" className="rounded bg-ink px-4 py-1.5 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save details'}</button>
                    <button type="button" onClick={() => setEditing(false)} className="rounded border px-4 py-1.5">Cancel</button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-lg border bg-white p-4 text-sm">
              <p className="mb-3 font-medium">Monthly pay structure</p>
              <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Earnings</p>
                  <div className="flex justify-between py-0.5"><span className="text-ink/70">Base salary</span><span>{money(profile.baseSalaryKobo)}</span></div>
                  {allowances.map((a, i) => (
                    <div key={i} className="flex justify-between py-0.5"><span className="text-ink/70">{a.name}</span><span>{money(a.amountKobo)}</span></div>
                  ))}
                  <div className="flex justify-between border-t pt-1.5 font-medium"><span>Gross</span><span>{money(profile.baseSalaryKobo + allowancesTotal)}</span></div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Deductions</p>
                  {deductions.length === 0 && <p className="py-0.5 text-ink/50">None</p>}
                  {deductions.map((d, i) => (
                    <div key={i} className="flex justify-between py-0.5"><span className="text-ink/70">{d.name}</span><span className="text-red-600">−{money(d.amountKobo)}</span></div>
                  ))}
                  <div className="flex justify-between border-t pt-1.5 font-medium"><span>Net (take-home)</span><span>{money(profile.baseSalaryKobo + allowancesTotal - deductionsTotal)}</span></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-medium"><Contact size={16} /> Staff ID card</p>
                {cardStatus?.card && (
                  <button onClick={handlePrintCard} className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-white">
                    <Printer size={15} /> Print my ID card
                  </button>
                )}
              </div>
              {cardStatus?.card ? (
                <p className="text-ink/60">Issued {new Date(cardStatus.card.issuedAt).toLocaleDateString(school.locale)}. Need a replacement? Send a new request.</p>
              ) : (
                <p className="text-ink/60">You don&apos;t have an ID card yet. Send a request and your school admin will approve it.</p>
              )}

              {!cardStatus?.hasPhoto && <p className="text-amber-700">Add your photo above first — it is required for the ID card.</p>}

              {!hasPending && (
                <form onSubmit={handleRequestCard} className="flex flex-wrap items-end gap-2">
                  <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
                    Reason (optional)
                    <input className="rounded border px-2 py-1.5" placeholder="e.g. First card, lost, damaged" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
                  </label>
                  <button disabled={requesting || !cardStatus?.hasPhoto} type="submit" className="flex items-center gap-1.5 rounded border px-3 py-1.5 disabled:opacity-50">
                    <Send size={15} /> {requesting ? 'Sending…' : 'Request ID card'}
                  </button>
                </form>
              )}

              {cardStatus && cardStatus.requests.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {cardStatus.requests.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between border-b py-1.5 last:border-0">
                      <span>
                        {new Date(r.createdAt).toLocaleDateString(school.locale)}
                        {r.reason ? ` · ${r.reason}` : ''}
                        {r.reviewNote ? <span className="text-xs text-ink/50"> — {r.reviewNote}</span> : null}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${REQUEST_STYLES[r.status]}`}>{r.status}</span>
                        {r.status === 'PENDING' && (
                          <button onClick={() => handleCancelRequest(r.id)} className="text-red-600" title="Cancel request"><X size={15} /></button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border bg-white p-4">
              <p className="mb-2 text-sm font-medium">Recent attendance</p>
              {attendance.length === 0 ? (
                <p className="text-sm text-ink/50">No attendance recorded yet.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {attendance.slice(0, 10).map((a) => (
                    <li key={a.id} className="flex justify-between border-b py-1 last:border-0">
                      <span>{a.direction === 'CLOCK_IN' ? 'Clock in' : 'Clock out'}</span>
                      <span className="text-ink/50">{new Date(a.occurredAt).toLocaleString(school.locale)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </RequireRole>
  );
}
