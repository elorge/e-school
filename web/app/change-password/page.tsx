// web/app/change-password/page.tsx
'use client';

import { useState } from 'react';
import { changePassword } from '@/lib/endpoints/auth';
import { getSessionUser, setSessionUser } from '@/lib/session';
import { ApiError } from '@/lib/api';
import PasswordInput from '@/components/PasswordInput';

function destinationFor(user: ReturnType<typeof getSessionUser>) {
  if (!user) return '/login';
  if (user.role === 'SUPER_ADMIN') return '/super-admin';
  if (user.role === 'FINANCE_OPS') return '/finance';
  if (!user.schoolSlug) return '/login';
  return `/${user.schoolSlug}/${user.role === 'SCHOOL_ADMIN' ? 'admin' : 'staff'}`;
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = getSessionUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      if (user) setSessionUser({ ...user, mustChangePassword: false });
      window.location.href = destinationFor(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change your password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-2 font-display text-2xl font-semibold">Set a new password</h1>
      <p className="mb-6 text-sm text-ink/60">
        Your account was set up by your school administrator. Choose a password only you know before continuing.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Current (temporary) password
          <PasswordInput value={currentPassword} onChange={setCurrentPassword} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          New password
          <PasswordInput value={newPassword} onChange={setNewPassword} minLength={8} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confirm new password
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} minLength={8} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-2 rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? 'Saving…' : 'Set password and continue'}
        </button>
      </form>
    </main>
  );
}