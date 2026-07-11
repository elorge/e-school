// web/app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/endpoints/auth';
import { ApiError } from '@/lib/api';

/**
 * Backend's password-reset email links here as
 * `${FRONTEND_RESET_PASSWORD_URL}?token=...` — see auth.controller.ts
 * RESET_URL_BASE. Your .env's FRONTEND_RESET_PASSWORD_URL must point at
 * this exact route.
 */
export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await resetPassword(token, newPassword);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'This reset link is invalid or has expired.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="mx-auto mt-16 max-w-sm px-4">
        <p className="text-sm text-red-600">This link is missing a reset token. Please request a new one.</p>
        <Link href="/forgot-password" className="mt-4 inline-block underline">
          Request a new link
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-6 text-xl font-semibold">Choose a new password</h1>
      {message ? (
        <div>
          <p className="text-sm text-green-700">{message}</p>
          <Link href="/login" className="mt-4 inline-block underline">
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            New password
            <input
              className="rounded border px-3 py-2"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Confirm password
            <input
              className="rounded border px-3 py-2"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
            {isSubmitting ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      )}
    </main>
  );
}