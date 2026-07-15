// web/app/[school]/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { uploadSchoolLogo, uploadSchoolSignature } from '@/lib/endpoints/uploads';
import { Settings, Image as ImageIcon, PenTool } from 'lucide-react';

export default function SchoolSettingsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [logoUrl, setLogoUrl] = useState(school.logoUrl);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
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
      setNotice('School logo updated — it will now appear on report cards, ID cards, and the calendar.');
    } catch {
      setError('Could not upload logo. Try a smaller image (under 5MB).');
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
      setNotice('Signature updated — it will now appear on report cards.');
    } catch {
      setError('Could not upload signature. Try a smaller image (under 5MB).');
    } finally {
      setUploadingSignature(false);
    }
  }

  return (
    <main className="flex flex-col gap-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <Settings size={20} /> {school.name} — Settings
      </h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <section className="card card-blue">
        <h2 className="mb-3 flex items-center gap-2 font-medium">
          <ImageIcon size={16} /> School logo
        </h2>
        <p className="mb-3 text-xs text-ink/50">Used on report cards, ID cards, and the academic calendar — never Elorge's own logo.</p>
        <div className="flex items-center gap-4">
          {logoUrl && <img src={logoUrl} alt="School logo" className="h-16 w-16 rounded-full border object-cover" />}
          <label className="btn-secondary cursor-pointer">
            {uploadingLogo ? 'Uploading…' : 'Upload logo'}
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
          <PenTool size={16} /> Head of School signature
        </h2>
        <p className="mb-3 text-xs text-ink/50">
          A scanned or photographed signature, ideally on a plain background — appears on printed report cards.
        </p>
        <div className="flex items-center gap-4">
          {signatureUrl && <img src={signatureUrl} alt="Signature" className="h-12 border-b object-contain" />}
          <label className="btn-secondary cursor-pointer">
            {uploadingSignature ? 'Uploading…' : 'Upload signature'}
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
  );
}