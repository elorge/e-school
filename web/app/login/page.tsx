// web/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/endpoints/auth';
import { getMyStaffProfile } from '@/lib/endpoints/staff';
import { ApiError } from '@/lib/api';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { loginLabelsFor } from '@/lib/i18n/login-labels';
import { apiErrorMessage } from '@/lib/i18n/error-messages';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
  const { locale } = useMarketingLocale();
  const t = loginLabelsFor(locale);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await login(email, password);

      if (data.user.mustChangePassword) {
        window.location.href = '/change-password';
        return;
      }
      if (data.user.role === 'SUPER_ADMIN') {
        window.location.href = '/super-admin';
        return;
      }
      if (data.user.role === 'FINANCE_OPS') {
        window.location.href = '/finance';
        return;
      }
      if (!data.user.schoolSlug) {
        setError(t.noSchoolLinked);
        return;
      }
      // From here on, every page the user sees is under [school]/ and
      // renders in THAT school's own configured language — this login
      // page's language (the visitor's browser language) was only ever
      // a best guess for the few seconds before we knew who they were.
      let destination = data.user.role === 'SCHOOL_ADMIN' ? 'admin' : 'staff';
      // An HR-flagged staff account lands on the HR dashboard rather than
      // the generic teaching one — see app/[school]/staff/hr/page.tsx.
      // Best-effort: if this lookup fails for any reason, they still get
      // signed in normally, just onto the regular staff dashboard, and
      // can navigate to /staff/hr manually (or via the nav's HR menu).
      if (data.user.role === 'STAFF') {
        try {
          const profile = await getMyStaffProfile(data.user.schoolSlug);
          if (profile.isHrManager) destination = 'staff/hr';
        } catch {
          // no staff profile yet, or a transient error — fall through to the regular staff dashboard
        }
      }
      window.location.href = `/${data.user.schoolSlug}/${destination}`;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(apiErrorMessage(err, locale, err.message));
      } else {
        setError(t.serverUnreachable);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-6 font-display text-2xl font-semibold">{t.signIn}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t.emailLabel}
            <input
              className="rounded border px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.passwordLabel}
            <PasswordInput value={password} onChange={setPassword} required />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
            {isSubmitting ? t.signingIn : t.signIn}
          </button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/forgot-password" className="underline">
            {t.forgotPassword}
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink/60">
          {t.newSchool}{' '}
          <Link href="/signup" className="text-brand-blue underline">
            {t.getStarted}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
