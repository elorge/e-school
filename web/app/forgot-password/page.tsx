// web/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/endpoints/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // Backend always responds the same way whether or not the email
    // exists (see AuthService docstring) — so there's nothing to branch
    // on here, just show the message.
    const data = await forgotPassword(email);
    setMessage(data.message);
    setIsSubmitting(false);
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-2 text-xl font-semibold">Reset your password</h1>
      <p className="mb-6 text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
      {message ? (
        <p className="text-sm text-green-700">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              className="rounded border px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting} className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}