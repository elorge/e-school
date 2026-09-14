// web/app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/endpoints/auth';
import { ApiError } from '@/lib/api';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { passwordFlowLabelsFor } from '@/lib/i18n/password-flow-labels';
import { apiErrorMessage } from '@/lib/i18n/error-messages';
import PasswordInput from '@/components/PasswordInput';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

/**
 * Backend's password-reset email links here as
 * `${FRONTEND_RESET_PASSWORD_URL}?token=...` — see auth.controller.ts
 * RESET_URL_BASE. Your .env's FRONTEND_RESET_PASSWORD_URL must point at
 * this exact route. Also reused by the staff-invite flow (see
 * AuthService.inviteStaff) — same page, same token mechanism.
 */
export default function ResetPasswordPage() {
  const { locale } = useMarketingLocale();
  const t = passwordFlowLabelsFor(locale);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      // Backend's success message is a fixed, non-parameterized string —
      // shown as our own localized copy instead of the (always-English)
      // response text.
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? apiErrorMessage(err, locale, t.invalidLinkError) : t.invalidLinkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-sm px-4 py-16">
          <p className="text-sm text-red-600">{t.missingTokenError}</p>
          <Link href="/forgot-password" className="mt-4 inline-block underline">
            {t.requestNewLink}
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-6 font-display text-2xl font-semibold">{t.chooseNewPasswordHeading}</h1>
        {submitted ? (
          <div>
            <p className="text-sm text-green-700">{t.newPasswordSetNotice}</p>
            <Link href="/login" className="mt-4 inline-block underline">
              {t.signIn}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              {t.newPasswordLabel}
              <PasswordInput value={newPassword} onChange={setNewPassword} minLength={8} required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.confirmNewPasswordLabel}
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} minLength={8} required />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
              {isSubmitting ? t.saving : t.setNewPasswordBtn}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
