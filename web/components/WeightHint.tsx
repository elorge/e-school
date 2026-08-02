// web/components/WeightHint.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWeights, type AssessmentWeight } from '@/lib/endpoints/assessment';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WeightHint({ school, classId, subject, componentName }: { school: string; classId: string; subject: string; componentName: string }) {
  const [weights, setWeights] = useState<AssessmentWeight[] | null>(null);

  useEffect(() => {
    getWeights(school, classId, subject).then(setWeights).catch(() => setWeights([]));
  }, [school, classId, subject]);

  if (weights === null) return null;

  if (weights.length === 0) {
    return (
      <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber/10 p-3 text-xs text-amber">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          No grading weights set for this class/subject yet — this test's score will replace the subject's final
          score directly (the old default behavior).{' '}
          <Link href={`/${school}/admin/academic/grading`} className="underline">
            Set up Test/Exam weighting →
          </Link>
        </span>
      </div>
    );
  }

  const matchesComponent = weights.some((w) => w.componentName.toLowerCase() === componentName.trim().toLowerCase());

  return (
    <div className={`mt-2 flex items-start gap-2 rounded-lg p-3 text-xs ${matchesComponent ? 'bg-brand-green/10 text-brand-green-dark' : 'bg-red-50 text-red-700'}`}>
      {matchesComponent ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
      <span>
        {weights.map((w) => `${w.componentName} ${w.weightPercent}%`).join(' · ')}
        {!matchesComponent && (
          <>
            {' '}— "{componentName}" doesn't match any configured component name above; this test's score won't count
            until the component name matches exactly.
          </>
        )}
      </span>
    </div>
  );
}