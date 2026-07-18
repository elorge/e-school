// web/app/[school]/admin/academic/grading/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listForClass } from '@/lib/endpoints/subjects';
import { getWeights, setWeights } from '@/lib/endpoints/assessment';
import type { Class } from '@/lib/types';
import RequireRole from '@/components/RequireRole';
import LoadingScreen from '@/components/LoadingScreen';
import { Percent, Plus, Trash2 } from 'lucide-react';

export default function GradingPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState(''); // blank = class-wide default
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [components, setComponents] = useState<{ componentName: string; weightPercent: number }[]>([
    { componentName: 'Test', weightPercent: 40 },
    { componentName: 'Exam', weightPercent: 60 },
  ]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listClasses(params.school).then(setClasses).finally(() => setIsLoading(false));
  }, [params.school]);

  useEffect(() => {
    if (!classId) return;
    listForClass(params.school, classId).then((cs) => setSubjectOptions(cs.map((c) => c.subject.name)));
    getWeights(params.school, classId, subject || undefined).then((w) => {
      if (w.length > 0) setComponents(w.map((x) => ({ componentName: x.componentName, weightPercent: x.weightPercent })));
    });
  }, [classId, subject, params.school]);

  function updateComponent(i: number, field: 'componentName' | 'weightPercent', value: string) {
    setComponents((c) => c.map((row, idx) => (idx === i ? { ...row, [field]: field === 'weightPercent' ? Number(value) : value } : row)));
  }

  const total = components.reduce((s, c) => s + c.weightPercent, 0);

  async function handleSave() {
    setError(null);
    setNotice(null);
    if (total !== 100) {
      setError(`Weights must sum to 100 — currently ${total}.`);
      return;
    }
    try {
      await setWeights(params.school, classId, subject || undefined, components);
      setNotice('Saved. New CBT results and manually-entered component scores for this class will now be weighted this way.');
    } catch {
      setError('Could not save — check the class/subject.');
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Percent size={20} /> {school.name} — Grading Weights
        </h1>
        <p className="text-sm text-ink/60">
          Decide how much of a subject's final score comes from Test vs Exam (or any breakdown you want). Leave
          unconfigured to keep entering one direct score, same as before.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <div className="card flex flex-wrap items-end gap-3">
          <select className="rounded border px-2 py-1.5 text-sm" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="rounded border px-2 py-1.5 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects (class default)</option>
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {classId && (
          <div className="card">
            <div className="mb-3 flex flex-col gap-2">
              {components.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded border px-2 py-1.5 text-sm"
                    placeholder="Component name (e.g. Test)"
                    value={c.componentName}
                    onChange={(e) => updateComponent(i, 'componentName', e.target.value)}
                  />
                  <input
                    className="w-20 rounded border px-2 py-1.5 text-center text-sm"
                    type="number"
                    value={c.weightPercent}
                    onChange={(e) => updateComponent(i, 'weightPercent', e.target.value)}
                  />
                  <span className="text-xs text-ink/40">%</span>
                  <button onClick={() => setComponents((cs) => cs.filter((_, idx) => idx !== i))} className="text-ink/30 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => setComponents((c) => [...c, { componentName: '', weightPercent: 0 }])} className="btn-secondary flex items-center gap-1.5 text-xs">
                <Plus size={13} /> Add component
              </button>
              <span className={`text-sm font-medium ${total === 100 ? 'text-brand-green' : 'text-red-600'}`}>Total: {total}%</span>
            </div>
            <button onClick={handleSave} className="btn-primary">Save weighting</button>
          </div>
        )}
      </main>
    </RequireRole>
  );
}