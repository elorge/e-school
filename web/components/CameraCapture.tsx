// web/components/CameraCapture.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

/**
 * Captures from the device camera (laptop webcam or phone camera via
 * getUserMedia), then compresses before handing back a File — max 480px
 * on the long edge, JPEG quality 0.75. A passport-style photo doesn't
 * need to be huge; this keeps uploads fast on a poor connection while
 * staying clearly legible for an ID card or report card.
 */
export default function CameraCapture({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 } } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('Could not access the camera — check browser permissions, or use file upload instead.'));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');

    const maxDim = 480;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPreviewBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      },
      'image/jpeg',
      0.75,
    );
  }

  function retake() {
    setPreviewUrl(null);
    setPreviewBlob(null);
  }

  function confirm() {
    if (!previewBlob) return;
    onCapture(new File([previewBlob], 'photo.jpg', { type: 'image/jpeg' }));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <button onClick={onClose} className="absolute right-4 top-4 text-white">
        <X size={24} />
      </button>

      {error ? (
        <p className="text-center text-sm text-white">{error}</p>
      ) : previewUrl ? (
        <>
          <img src={previewUrl} alt="Captured" className="max-h-[60vh] rounded-lg" />
          <div className="mt-4 flex gap-3">
            <button onClick={retake} className="btn-secondary flex items-center gap-1.5">
              <RotateCcw size={15} /> Retake
            </button>
            <button onClick={confirm} className="btn-primary">
              Use this photo
            </button>
          </div>
        </>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="max-h-[60vh] rounded-lg" />
          <button onClick={capture} className="btn-primary mt-4 flex items-center gap-1.5">
            <Camera size={16} /> Capture
          </button>
        </>
      )}
    </div>
  );
}