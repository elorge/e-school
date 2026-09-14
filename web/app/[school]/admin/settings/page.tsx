// web/app/[school]/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { uploadSchoolLogo, uploadSchoolSignature } from '@/lib/endpoints/uploads';
import { setMyLocale } from '@/lib/endpoints/schools';
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '@/lib/locale';
import { settingsLabelsFor } from '@/lib/i18n/settings-labels';
import { Settings, Image as ImageIcon, PenTool, Globe2 } from 'lucide-react';
import RequireRole from '@/components/RequireRole';

export default function SchoolSettingsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = settingsLabelsFor(school.locale);
  const [logoUrl, setLogoUrl] = useState(school.logoUrl);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [locale, setLocale] = useState(school.locale);
  const [savingLocale, setSavingLocale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  async function handleLogoUpload(file: File) {
    setError(null);
    setUploadingLogo(true);
    try {
      const { url } = await uploadSchoolLogo(params.school, file);
      setLogoUrl(url);
      setNotice(t.logoUpdatedNotice);
    } catch {
      setError(t.logoUploadError);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSignatureUpload(file: File) {
    setError(null);
    setUploadingSignature(true);
    try {
      const { url } = await uploadSchoolSignature(params.school, file);
      setSignatureUrl(url);
      setNotice(t.signatureUpdatedNotice);
    } catch {
      setError(t.signatureUploadError);
    } finally {
      setUploadingSignature(false);
    }
  }

  async function handleLocaleChange(next: string) {
    const previous = locale;
    setLocale(next); // optimistic — the select feels instant
    setError(null);
    setSavingLocale(true);
    try {
      await setMyLocale(next);
      setNotice(t.languageUpdatedNotice);
    } catch {
      setLocale(previous); // roll back on failure so the dropdown doesn't lie about what's saved
      setError(t.languageUpdateError);
    } finally {
      setSavingLocale(false);
    }
  }

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <Settings size={20} /> {school.name} — {t.pageTitle}
      </h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <section className="card card-blue">
        <h2 className="mb-3 flex items-center gap-2 font-medium">
          <Globe2 size={16} /> {t.languageHeading}
        </h2>
        <p className="mb-3 text-xs text-ink/50">{t.languageHelp}</p>
        <select
          className="rounded border px-3 py-2 text-sm"
          value={locale}
          disabled={savingLocale}
          onChange={(e) => handleLocaleChange(e.target.value)}
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABELS[l]}
            </option>
          ))}
        </select>
      </section>

      <section className="card card-blue">
        <h2 className="mb-3 flex items-center gap-2 font-medium">
          <ImageIcon size={16} /> {t.logoHeading}
        </h2>
        <p className="mb-3 text-xs text-ink/50">{t.logoHelp}</p>
        <div className="flex items-center gap-4">
          {logoUrl && <img src={logoUrl} alt="School logo" className="h-16 w-16 rounded-full border object-cover" />}
          <label className="btn-secondary cursor-pointer">
            {uploadingLogo ? t.uploadingBtn : t.uploadLogoBtn}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingLogo}
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
          </label>
        </div>
      </section>

      <section className="card card-blue">
        <h2 className="mb-3 flex items-center gap-2 font-medium">
          <PenTool size={16} /> {t.signatureHeading}
        </h2>
        <p className="mb-3 text-xs text-ink/50">{t.signatureHelp}</p>
        <div className="flex items-center gap-4">
          {signatureUrl && <img src={signatureUrl} alt="Signature" className="h-12 border-b object-contain" />}
          <label className="btn-secondary cursor-pointer">
            {uploadingSignature ? t.uploadingBtn : t.uploadSignatureBtn}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingSignature}
              onChange={(e) => e.target.files?.[0] && handleSignatureUpload(e.target.files[0])}
            />
          </label>
        </div>
      </section>
    </main>
    </RequireRole>
  );
}
