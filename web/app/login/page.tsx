// web/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/endpoints/auth';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await login(email, password); // stores token + session user, including schoolSlug

      if (data.user.role === 'SUPER_ADMIN') {
        window.location.href = '/super-admin';
        return;
      }
      if (data.user.role === 'FINANCE_OPS') {
        window.location.href = '/finance';
        return;
      }
      if (!data.user.schoolSlug) {
        setError('Your account is not linked to a school workspace yet. Contact your school administrator.');
        return;
      }
      const destination = data.user.role === 'SCHOOL_ADMIN' ? 'admin' : 'staff';
      window.location.href = `/${data.user.schoolSlug}/${destination}`;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Could not reach the server. Check that the backend is running and reachable, and that CORS allows this origin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-6 font-display text-2xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input className="rounded border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            className="rounded border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-2 rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/forgot-password" className="underline">
          Forgot your password?
        </Link>
      </p>
    </main>
  );
}