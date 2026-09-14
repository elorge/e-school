// web/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/endpoints/auth';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { passwordFlowLabelsFor } from '@/lib/i18n/password-flow-labels';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function ForgotPasswordPage() {
  const { locale } = useMarketingLocale();
  const t = passwordFlowLabelsFor(locale);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // Backend always responds the same way whether or not the email
    // exists (see AuthService docstring) — the response body's own
    // message is a fixed, non-parameterized string, so we show our own
    // localized copy instead of the backend's (always-English) text.
    await forgotPassword(email);
    setSubmitted(true);
    setIsSubmitting(false);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-2 font-display text-2xl font-semibold">{t.resetYourPassword}</h1>
        <p className="mb-6 text-sm text-ink/60">{t.forgotIntro}</p>
        {submitted ? (
          <p className="text-sm text-green-700">{t.resetLinkSentNotice}</p>
        ) : (
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
            <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
              {isSubmitting ? t.sending : t.sendResetLink}
            </button>
          </form>
        )}
        <p className="mt-6 text-sm">
          <Link href="/login" className="underline">
            {t.backToSignIn}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
