// web/app/[school]/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { getBalance, initializePayment } from '@/lib/endpoints/wallet';
import { listStaff, removeStaff } from '@/lib/endpoints/users';
import { inviteStaff, createUser } from '@/lib/endpoints/auth';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { listTerms } from '@/lib/endpoints/terms';
import ResultEntryModal from '@/components/ResultEntryModal';
import type { Class, Student, Term } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import { Wallet } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { formatMoney, majorToMinor } from '@/lib/currency';
import { ApiError } from '@/lib/api';
import type { User } from '@/lib/types';

export default function SchoolAdminPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [balanceKobo, setBalanceKobo] = useState<number | null>(null);
  const [staff, setStaff] = useState<User[]>([]);
  const [fundAmount, setFundAmount] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reassignPromptFor, setReassignPromptFor] = useState<string | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classFilter, setClassFilter] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [resultModalStudent, setResultModalStudent] = useState<Student | null>(null);
  const [staffMode, setStaffMode] = useState<'invite' | 'direct'>('invite');
  const [newStaff, setNewStaff] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  async function loadData() {
    try {
      const [balance, staffList, classList, termList] = await Promise.all([
        getBalance(params.school),
        listStaff(params.school),
        listClasses(params.school),
        listTerms(params.school),
      ]);
      setBalanceKobo(balance.balanceKobo);
      setStaff(staffList);
      setClasses(classList);
      setTerms(termList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStudents(classId: string) {
    if (!classId) {
      setStudents([]);
      return;
    }
    try {
      const list = await listStudents(params.school, classId);
      setStudents(list.filter((s) => s.status === 'ACTIVE'));
    } catch {
      setError('Failed to load students for this class');
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStudents(classFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFilter]);

  async function handleFundWallet(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const amountKobo = majorToMinor(Number(fundAmount), school.currency);
      const { redirectUrl } = await initializePayment(params.school, { amountKobo, payerEmail });
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start payment');
    }
  }

 async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsCreatingStaff(true);
    try {
      if (staffMode === 'invite') {
        await inviteStaff({ fullName: newStaff.fullName, email: newStaff.email });
        setNotice(`Invite sent to ${newStaff.email} — they'll set their own password to activate the account.`);
      } else {
        if (newStaff.password !== newStaff.confirmPassword) {
          setError('Passwords do not match.');
          setIsCreatingStaff(false);
          return;
        }
        await createUser({ fullName: newStaff.fullName, email: newStaff.email, password: newStaff.password, role: 'STAFF' });
        setNotice(`Account created for ${newStaff.email}. Share the password with them directly — they'll be asked to change it on first login.`);
      }
      setNewStaff({ fullName: '', email: '', password: '', confirmPassword: '' });
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create staff account');
    } finally {
      setIsCreatingStaff(false);
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

if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Admin</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-brand-green">{notice}</p>}
      <section className="stat-hero">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/60">
              <Wallet size={13} /> Wallet balance
            </p>
            <p className="font-display text-4xl font-semibold">
              {balanceKobo === null ? '—' : formatMoney(balanceKobo, school.currency)}
            </p>
          </div>
        </div>
        <form onSubmit={handleFundWallet} className="relative mt-6 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Amount ({school.currency})
            <input
              className="rounded border-0 bg-white/90 px-2 py-1.5 text-ink"
              type="number"
              min="1"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Payer email
            <input
              className="rounded border-0 bg-white/90 px-2 py-1.5 text-ink"
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn-primary relative bg-white text-brand-blue hover:bg-white/90">
            Fund wallet
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Staff</h2>

        <div className="mb-3 flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setStaffMode('invite')}
            className={`rounded-full px-3 py-1 ${staffMode === 'invite' ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
          >
            Invite by email
          </button>
          <button
            type="button"
            onClick={() => setStaffMode('direct')}
            className={`rounded-full px-3 py-1 ${staffMode === 'direct' ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
          >
            Set password now
          </button>
        </div>
        <form onSubmit={handleCreateStaff} className="mb-4 flex flex-wrap items-end gap-2 border-b pb-4">
          <label className="flex flex-col gap-1 text-sm">
            Full name
            <input
              className="rounded border px-2 py-1.5"
              value={newStaff.fullName}
              onChange={(e) => setNewStaff((f) => ({ ...f, fullName: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              className="rounded border px-2 py-1.5"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          {staffMode === 'direct' && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                Temporary password
                <PasswordInput value={newStaff.password} onChange={(v) => setNewStaff((f) => ({ ...f, password: v }))} minLength={8} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Confirm password
                <PasswordInput
                  value={newStaff.confirmPassword}
                  onChange={(v) => setNewStaff((f) => ({ ...f, confirmPassword: v }))}
                  minLength={8}
                  required
                />
              </label>
            </>
          )}
          <button type="submit" disabled={isCreatingStaff} className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white disabled:opacity-50">
            {isCreatingStaff ? 'Saving…' : staffMode === 'invite' ? 'Send invite' : 'Create account'}
          </button>
        </form>

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
    <section className="card">
        <h2 className="mb-3 font-medium">Students &amp; Results</h2>
        <select className="mb-3 rounded border px-2 py-1.5 text-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">Select a class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {classFilter && students.length === 0 && <p className="text-sm text-ink/40">No active students in this class.</p>}
        <ul className="flex flex-col gap-1">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg border border-black/5 px-3 py-2 text-sm">
              <span>
                {s.firstName} {s.lastName} — <span className="font-mono text-xs text-ink/50">{s.studentId ?? 'pending ID'}</span>
              </span>
              <button onClick={() => setResultModalStudent(s)} className="text-brand-blue underline">
                Enter results
              </button>
            </li>
          ))}
        </ul>
      </section>

      {resultModalStudent && (
        <ResultEntryModal
          school={params.school}
          studentId={resultModalStudent.id}
          studentName={`${resultModalStudent.firstName} ${resultModalStudent.lastName}`}
          classId={resultModalStudent.classId}
          terms={terms}
          onClose={() => setResultModalStudent(null)}
        />
      )}
    </main>
  );
}