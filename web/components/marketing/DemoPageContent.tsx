// web/components/marketing/DemoPageContent.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CalendarCheck } from 'lucide-react';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { demoLabelsFor } from '@/lib/i18n/demo-labels';
import { SUPPORTED_COUNTRIES } from '@/lib/currency';
import { requestDemo } from '@/lib/endpoints/demos';
import { track } from '@/lib/analytics';

const INPUT =
  'w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20';
const STUDENT_RANGES = ['<100', '100-500', '500-1000', '1000+'];

const today = () => new Date().toISOString().slice(0, 10);

export default function DemoPageContent() {
  const { locale } = useMarketingLocale();
  const t = demoLabelsFor(locale);

  const [form, setForm] = useState({
    name: '', schoolName: '', email: '', phone: '', countryCode: '',
    preferredDate: '', timeOfDay: '', studentCount: '', message: '', website: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (form.name.trim().length < 2) return t.errName;
    if (form.schoolName.trim().length < 2) return t.errSchool;
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return t.errEmail;
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 7) return t.errPhone;
    if (!form.countryCode) return t.errCountry;
    if (form.preferredDate && form.preferredDate < today()) return t.errDate;
    return '';
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) { setError(problem); return; }
    setError(''); setBusy(true);
    try {
      await requestDemo({
        name: form.name.trim(),
        schoolName: form.schoolName.trim(),
        email: form.email.trim(),
        countryCode: form.countryCode,
        website: form.website,
        locale,
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.preferredDate && { preferredDate: form.preferredDate }),
        ...(form.timeOfDay && { timeOfDay: form.timeOfDay as 'morning' | 'afternoon' | 'evening' }),
        ...(form.studentCount && { studentCount: form.studentCount }),
        ...(form.message.trim() && { message: form.message.trim() }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      track('demo_requested', { locale });
      setDone(true);
    } catch {
      setError(t.errSend);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-24">
      <section className="flex flex-col gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">{t.kicker}</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink">{t.title}</h1>
        <p className="text-lg text-ink/70">{t.subtitle}</p>
        <ul className="flex flex-col gap-3">
          {t.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-ink/70">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-green" /> {b}
            </li>
          ))}
        </ul>
      </section>

      <section>
        {done ? (
          <div className="card flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              <CalendarCheck size={26} />
            </div>
            <h2 className="font-display text-2xl font-semibold">{t.successTitle}</h2>
            <p className="max-w-sm text-ink/60">{t.successBody}</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/" className="btn-primary">{t.backHome}</Link>
              <Link href="/pricing" className="btn-secondary">{t.seePricing}</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="card flex flex-col gap-3" noValidate>
            <input className={INPUT} placeholder={t.name} autoComplete="name" value={form.name} maxLength={80} onChange={set('name')} />
            <input className={INPUT} placeholder={t.school} autoComplete="organization" value={form.schoolName} maxLength={120} onChange={set('schoolName')} />
            <input className={INPUT} placeholder={t.email} type="email" autoComplete="email" value={form.email} maxLength={160} onChange={set('email')} />
            <input className={INPUT} placeholder={`${t.phone} (${t.optional})`} type="tel" autoComplete="tel" value={form.phone} maxLength={24} onChange={set('phone')} />
            <select className={INPUT} aria-label={t.country} value={form.countryCode} onChange={set('countryCode')}>
              <option value="">{t.selectCountry}</option>
              {SUPPORTED_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-ink/50">
                {t.date} ({t.optional})
                <input className={INPUT} type="date" min={today()} value={form.preferredDate} onChange={set('preferredDate')} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-ink/50">
                {t.timeOfDay} ({t.optional})
                <select className={INPUT} value={form.timeOfDay} onChange={set('timeOfDay')}>
                  <option value="">{t.anyTime}</option>
                  <option value="morning">{t.morning}</option>
                  <option value="afternoon">{t.afternoon}</option>
                  <option value="evening">{t.evening}</option>
                </select>
              </label>
            </div>

            <select className={INPUT} aria-label={t.students} value={form.studentCount} onChange={set('studentCount')}>
              <option value="">{`${t.students} (${t.optional})`}</option>
              {STUDENT_RANGES.map((r) => <option key={r} value={r}>{r.replace('-', '–')}</option>)}
            </select>
            <textarea className={`${INPUT} min-h-[84px] resize-none`} placeholder={`${t.message} (${t.optional})`} value={form.message} maxLength={1000} onChange={set('message')} />

            {/* Honeypot: invisible to people, tempting to bots */}
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0"
              value={form.website} onChange={set('website')} />

            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ? t.submitting : t.submit}</button>
            <p className="text-center text-xs text-ink/40">{t.privacy}</p>
          </form>
        )}
      </section>
    </main>
  );
}
