// web/components/StaffPhotoEditor.tsx
'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, User } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { uploadStaffPhoto } from '@/lib/endpoints/uploads';

/**
 * Photo + "Upload" / "Take photo" buttons for a staff profile. Used on
 * My Info (staff changing their own photo) and on the admin staff detail
 * page (admin/HR helping a colleague). Reuses CameraCapture, the same
 * snap-and-compress component the Students page uses.
 */
export default function StaffPhotoEditor({
  school,
  staffProfileId,
  photoUrl,
  onChanged,
}: {
  school: string;
  staffProfileId: string;
  photoUrl: string | null;
  onChanged: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadStaffPhoto(school, staffProfileId, file);
      onChanged(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload this photo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {photoUrl ? (
        <img src={photoUrl} alt="Staff photo" className="h-24 w-20 rounded-lg border object-cover" />
      ) : (
        <div className="flex h-24 w-20 items-center justify-center rounded-lg border bg-black/5 text-ink/30">
          <User size={32} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} Upload photo
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => setCameraOpen(true)}
            className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            <Camera size={15} /> Take photo
          </button>
        </div>
        <p className="text-xs text-ink/50">A clear, front-facing passport-style photo. It appears on the staff ID card.</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {cameraOpen && <CameraCapture onCapture={handleFile} onClose={() => setCameraOpen(false)} />}
    </div>
  );
}
