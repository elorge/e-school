// web/app/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestSignup } from '@/lib/endpoints/schools';
import { SUPPORTED_COUNTRIES, currencyForCountry } from '@/lib/currency';
import { SUPPORTED_LOCALES, LOCALE_LABELS, localeForCountry } from '@/lib/locale';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { signupLabelsFor } from '@/lib/i18n/signup-labels';
import { apiErrorMessage } from '@/lib/i18n/error-messages';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PasswordInput from '@/components/PasswordInput';

export default function SignupPage() {
  // The VISITOR's own browser language (drives this form's own UI) is a
  // separate concept from form.locale (the language the SCHOOL BEING
  // CREATED will use going forward) — a French-speaking admin signing up
  // a school that will run in English is a perfectly normal case.
  const { locale: pageLocale } = useMarketingLocale();
  const t = signupLabelsFor(pageLocale);

  const [form, setForm] = useState({
    schoolName: '',
    slug: '',
    code: '',
    countryCode: '',
    locale: '' as string,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const currency = form.countryCode ? currencyForCountry(form.countryCode) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.adminPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    if (!form.countryCode || !currency) {
      setError(t.selectCountryError);
      return;
    }
    if (!form.locale) {
      setError(t.selectLanguageError);
      return;
    }
    setIsSubmitting(true);
    try {
      await requestSignup({ ...form, currency });
      setSubmitted(true);
    } catch (err) {
      // Known codes (workspace name / school code already taken) get a
      // real translation; anything else falls back to the generic message.
      setError(apiErrorMessage(err, pageLocale, t.genericError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 font-display text-2xl font-semibold">{t.heading}</h1>
        <p className="mb-8 text-sm text-ink/60">{t.subheading}</p>

        {submitted ? (
          <div className="rounded-xl bg-brand-green/10 p-6 text-brand-green-dark">
            <p className="font-medium">{t.requestReceivedTitle}</p>
            <p className="mt-1 text-sm">{t.requestReceivedBody(form.adminEmail)}</p>
            <Link href="/" className="mt-4 inline-block text-sm underline">
              {t.backToHome}
            </Link>
          </div>
        ) : (
          <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              {t.countryLabel}
              <select
                className="rounded border px-3 py-2"
                value={form.countryCode}
                onChange={(e) => {
                  const countryCode = e.target.value;
                  setForm((f) => ({ ...f, countryCode, locale: countryCode ? localeForCountry(countryCode) : '' }));
                }}
                required
              >
                <option value="">{t.selectYourCountry}</option>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {currency && <span className="text-xs text-ink/50">{t.billedInCurrency(currency)}</span>}
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.languageLabel}
              <select
                className="rounded border px-3 py-2"
                value={form.locale}
                onChange={(e) => update('locale', e.target.value)}
                required
              >
                {!form.countryCode && <option value="">{t.selectCountryFirst}</option>}
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </option>
                ))}
              </select>
              <span className="text-xs text-ink/50">{t.languageHelp}</span>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.schoolNameLabel}
              <input
                className="rounded border px-3 py-2"
                value={form.schoolName}
                onChange={(e) => update('schoolName', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.workspaceNameLabel}
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
              {t.schoolCodeLabel}
              <input
                className="rounded border px-3 py-2 uppercase"
                placeholder="GRW"
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.yourNameLabel}
              <input
                className="rounded border px-3 py-2"
                value={form.adminName}
                onChange={(e) => update('adminName', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.yourEmailLabel}
              <input
                className="rounded border px-3 py-2"
                type="email"
                value={form.adminEmail}
                onChange={(e) => update('adminEmail', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.choosePasswordLabel}
              <PasswordInput value={form.adminPassword} onChange={(v) => update('adminPassword', v)} minLength={8} required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.confirmPasswordLabel}
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} minLength={8} required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t.phoneLabel}
              <input className="rounded border px-3 py-2" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <label className="flex items-start gap-2 text-xs text-ink/60">
              <input type="checkbox" required className="mt-0.5" />
              {t.consentPrefix}{' '}
              <Link href="/terms" className="text-brand-blue underline">{t.termsLink}</Link> {t.andText}{' '}
              <Link href="/privacy" className="text-brand-blue underline">{t.privacyLink}</Link>.
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-full bg-brand-blue px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? t.submitting : t.requestAccess}
            </button>
          </form>
          <p className="mt-4 text-sm">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="text-brand-blue underline">
              {t.signIn}
            </Link>
          </p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
