// web/app/[school]/results/page.tsx
'use client';

import { useState } from 'react';
import { lookupResult } from '@/lib/endpoints/pins';
import { fetchPublicReportCardPdf } from '@/lib/endpoints/documents';
import { ApiError } from '@/lib/api';
import { Download, Printer, ArrowLeft } from 'lucide-react';

interface LookupResult {
  id: string;
  studentId: string;
  termId: string;
  subjectScores: Record<string, number>;
  teacherComment: string | null;
}

function scoreColor(score: number) {
  if (score >= 70) return 'bg-brand-green';
  if (score >= 50) return 'bg-amber';
  return 'bg-red-500';
}

/**
 * Student-facing PIN portal. Deliberately public — the backend marks
 * this route @Public(), so no login token is needed or sent here.
 */
export default function ResultsPage({ params }: { params: { school: string } }) {
  const [admissionId, setAdmissionId] = useState('');
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const data = (await lookupResult(params.school, admissionId, pin)) as LookupResult;
      setResult(data);
      await loadPdf(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadPdf(data: LookupResult) {
    setIsPdfLoading(true);
    setError(null);
    try {
      const blob = await fetchPublicReportCardPdf(params.school, data.studentId, data.termId, pin, admissionId);
      setPdfBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      // Surface the REAL reason instead of a generic message — a wrong
      // studentId/termId mismatch, an expired PIN, or a genuine server
      // error all need to be distinguishable to actually debug this.
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not load the printable report card: ${message}`);
      console.error('Report card PDF fetch failed:', err);
    } finally {
      setIsPdfLoading(false);
    }
  }

  function handlePrint() {
    if (!pdfBlobUrl) return;
    const win = window.open(pdfBlobUrl, '_blank');
    win?.addEventListener('load', () => win.print());
  }

  function handleDownload() {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `report-card-${admissionId}.pdf`;
    a.click();
  }

  function handleBack() {
    setResult(null);
    setPdfBlobUrl(null);
    setError(null);
  }

  // ── Full report view — takes over the page once a result is found ──────
  if (result) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
            <ArrowLeft size={15} /> Check another result
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={!pdfBlobUrl}
              className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-40"
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleDownload}
              disabled={!pdfBlobUrl}
              className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-40"
            >
              <Download size={15} /> Download PDF
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {/* On-screen report layout — same information as the PDF, readable without a download */}
        <div className="card mb-4">
          <h1 className="mb-4 font-display text-xl font-semibold">Subject Scores</h1>
          <div className="flex flex-col gap-2">
            {Object.entries(result.subjectScores).map(([subject, score]) => (
              <div key={subject} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-ink/70">{subject}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/5">
                  <span className={`block h-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right font-mono text-sm">{score}</span>
              </div>
            ))}
          </div>
          {result.teacherComment && (
            <p className="mt-4 border-t pt-3 text-sm italic text-ink/70">"{result.teacherComment}"</p>
          )}
        </div>

        {/* Embedded PDF preview — the actual document that prints/downloads */}
        {isPdfLoading && <p className="text-center text-sm text-ink/40">Loading printable report card…</p>}
        {pdfBlobUrl && (
          <div className="overflow-hidden rounded-xl border border-black/10 shadow-sm">
            <iframe src={pdfBlobUrl} className="h-[70vh] w-full" title="Report card" />
          </div>
        )}
      </main>
    );
  }

  // ── Lookup form ──────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-4 font-display text-xl font-semibold">Check your result</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Admission ID
          <input className="rounded border px-3 py-2" value={admissionId} onChange={(e) => setAdmissionId(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          PIN
          <input className="rounded border px-3 py-2" value={pin} onChange={(e) => setPin(e.target.value)} type="password" required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
          {isSubmitting ? 'Checking…' : 'View result'}
        </button>
      </form>
    </main>
  );
}