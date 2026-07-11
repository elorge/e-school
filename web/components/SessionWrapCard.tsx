// web/components/SessionWrapCard.tsx
import type { SessionWrap } from '@/lib/endpoints/insights';

export default function SessionWrapCard({ wrap }: { wrap: SessionWrap }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-ink p-8 text-white torn-edge">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Session Wrap</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">{wrap.academicSession}</h2>
      <p className="mt-1 text-sm text-white/60">
        {wrap.studentName} — {wrap.termsCovered} term(s) on file
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {wrap.subjects.map((s) => (
          <div key={s.subject} className="flex items-center gap-2 text-sm">
            <span className="w-32 shrink-0 text-white/70">{s.subject}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className={`block h-full ${s.average >= 70 ? 'bg-brand-green' : s.average >= 50 ? 'bg-amber' : 'bg-red-500'}`}
                style={{ width: `${s.average}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-xs">{s.average}</span>
          </div>
        ))}
      </div>

      {wrap.suggestedFields.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Fields worth exploring</p>
          <div className="flex flex-wrap gap-2">
            {wrap.suggestedFields.map((f) => (
              <span key={f.field} className="rounded-full bg-white/10 px-3 py-1 text-xs" title={f.supportingSubjects.join(', ')}>
                {f.field}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-white/50">{wrap.narrative}</p>
    </div>
  );
}