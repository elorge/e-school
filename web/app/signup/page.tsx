// web/app/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestSignup } from '@/lib/endpoints/schools';
import { ApiError } from '@/lib/api';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function SignupPage() {
  const [form, setForm] = useState({
    schoolName: '',
    slug: '',
    code: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestSignup(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 font-display text-2xl font-semibold">Bring your school onto Elorge</h1>
        <p className="mb-8 text-sm text-ink/60">
          Tell us a bit about your school. Our team reviews every request and activates your workspace, usually
          within one business day.
        </p>

        {submitted ? (
          <div className="rounded-xl bg-brand-green/10 p-6 text-brand-green-dark">
            <p className="font-medium">Request received.</p>
            <p className="mt-1 text-sm">We'll email {form.adminEmail} once your workspace is ready.</p>
            <Link href="/" className="mt-4 inline-block text-sm underline">
              Back to home
            </Link>
          </div>
        ) : (
          <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              School name
              <input
                className="rounded border px-3 py-2"
                value={form.schoolName}
                onChange={(e) => update('schoolName', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Workspace name (used in your web address)
              <input
                className="rounded border px-3 py-2"
                placeholder="greenwood-college"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value.toLowerCase())}
                pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              School code (2-10 letters/numbers, used on Admission IDs)
              <input
                className="rounded border px-3 py-2 uppercase"
                placeholder="GRW"
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Your name (School Admin)
              <input
                className="rounded border px-3 py-2"
                value={form.adminName}
                onChange={(e) => update('adminName', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Your email
              <input
                className="rounded border px-3 py-2"
                type="email"
                value={form.adminEmail}
                onChange={(e) => update('adminEmail', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Choose a password
              <input
                className="rounded border px-3 py-2"
                type="password"
                minLength={8}
                value={form.adminPassword}
                onChange={(e) => update('adminPassword', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Phone (optional)
              <input className="rounded border px-3 py-2" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-brand-blue px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting…' : 'Request access'}
            </button>
          </form>
          <p className="mt-4 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-blue underline">
              Sign in
            </Link>
          </p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}