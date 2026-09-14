// web/app/change-password/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { changePassword } from '@/lib/endpoints/auth';
import { getSchoolBySlug } from '@/lib/endpoints/schools';
import { getSessionUser, setSessionUser } from '@/lib/session';
import { ApiError } from '@/lib/api';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { passwordFlowLabelsFor } from '@/lib/i18n/password-flow-labels';
import { apiErrorMessage } from '@/lib/i18n/error-messages';
import PasswordInput from '@/components/PasswordInput';

function destinationFor(user: ReturnType<typeof getSessionUser>) {
  if (!user) return '/login';
  if (user.role === 'SUPER_ADMIN') return '/super-admin';
  if (user.role === 'FINANCE_OPS') return '/finance';
  if (!user.schoolSlug) return '/login';
  return `/${user.schoolSlug}/${user.role === 'SCHOOL_ADMIN' ? 'admin' : 'staff'}`;
}

export default function ChangePasswordPage() {
  const user = getSessionUser();
  // Unlike other auth pages, this one is hit by an ALREADY-authenticated
  // user whose school we already know — so we fetch that school's real
  // configured language instead of guessing from the visitor's browser.
  const { locale: browserLocale } = useMarketingLocale();
  const [schoolLocale, setSchoolLocale] = useState<string | null>(null);
  const locale = schoolLocale ?? browserLocale;
  const t = passwordFlowLabelsFor(locale);

  useEffect(() => {
    if (user?.schoolSlug) {
      getSchoolBySlug(user.schoolSlug).then((school) => {
        if (school) setSchoolLocale(school.locale);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await changePassword(currentPassword, newPassword);
      if (user) setSessionUser({ ...user, mustChangePassword: false });
      window.location.href = destinationFor(user);
    } catch (err) {
      setError(err instanceof ApiError ? apiErrorMessage(err, locale, err.message) : t.couldNotChangePassword);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-2 font-display text-2xl font-semibold">{t.changePasswordHeading}</h1>
      <p className="mb-6 text-sm text-ink/60">{t.changePasswordIntro}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t.currentPasswordLabel}
          <PasswordInput value={currentPassword} onChange={setCurrentPassword} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t.newPasswordLabel}
          <PasswordInput value={newPassword} onChange={setNewPassword} minLength={8} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t.confirmNewPasswordLabel}
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} minLength={8} required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="mt-2 rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50">
          {isSubmitting ? t.saving : t.changePasswordBtn}
        </button>
      </form>
    </main>
  );
}
