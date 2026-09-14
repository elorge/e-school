// web/app/[school]/admin/academic/grading/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listForClass } from '@/lib/endpoints/subjects';
import { listTerms } from '@/lib/endpoints/terms';
import { getWeights, setWeights, getCoverage, type AssessmentWeightCoverageRow } from '@/lib/endpoints/assessment';
import { gradingLabelsFor, type GradingLabels } from '@/lib/i18n/grading-labels';
import type { Class, Term } from '@/lib/types';
import RequireRole from '@/components/RequireRole';
import LoadingScreen from '@/components/LoadingScreen';
import { Percent, Plus, Trash2, CircleCheck, CircleDashed, Circle } from 'lucide-react';

const DEFAULT_COMPONENTS = [
  { componentName: 'Test', weightPercent: 40 },
  { componentName: 'Exam', weightPercent: 60 },
];

function levelLabel(level: AssessmentWeightCoverageRow['level'], t: GradingLabels): string {
  switch (level) {
    case 'term-subject':
      return t.levelTermSubject;
    case 'subject-default':
      return t.levelSubjectDefault;
    case 'term-classwide':
      return t.levelTermClasswide;
    case 'class-default':
      return t.levelClassDefault;
    default:
      return t.levelUnweighted;
  }
}

function CoverageIcon({ level }: { level: AssessmentWeightCoverageRow['level'] }) {
  if (level === 'term-subject') return <CircleCheck size={14} className="text-brand-green" />;
  if (level === 'unweighted') return <Circle size={14} className="text-red-400" />;
  return <CircleDashed size={14} className="text-amber" />;
}

export default function GradingPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = gradingLabelsFor(school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classId, setClassId] = useState('');
  const [termId, setTermId] = useState(''); // blank = applies to every term (class/subject default)
  const [subject, setSubject] = useState(''); // blank = class-wide default
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [components, setComponents] = useState<{ componentName: string; weightPercent: number }[]>(DEFAULT_COMPONENTS);
  const [coverage, setCoverage] = useState<AssessmentWeightCoverageRow[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listClasses(params.school), listTerms(params.school)])
      .then(([cs, ts]) => {
        setClasses(cs);
        setTerms(ts);
      })
      .finally(() => setIsLoading(false));
  }, [params.school]);

  useEffect(() => {
    if (!classId) return;
    setNotice(null);
    setError(null);
    listForClass(params.school, classId).then((cs) => setSubjectOptions(cs.map((c) => c.subject.name)));
    refreshCoverage();
    getWeights(params.school, classId, subject || undefined, termId || undefined).then((w) => {
      // No weights at this specificity (or any level the backend fell back
      // through) must NOT keep showing whatever was loaded for the
      // previous term/subject selection — reset to the plain default.
      setComponents(
        w.length > 0 ? w.map((x) => ({ componentName: x.componentName, weightPercent: x.weightPercent })) : DEFAULT_COMPONENTS,
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subject, termId, params.school]);

  function refreshCoverage() {
    if (!classId) return;
    getCoverage(params.school, classId, subject || undefined).then(setCoverage);
  }

  function updateComponent(i: number, field: 'componentName' | 'weightPercent', value: string) {
    setComponents((c) => c.map((row, idx) => (idx === i ? { ...row, [field]: field === 'weightPercent' ? Number(value) : value } : row)));
  }

  const total = components.reduce((s, c) => s + c.weightPercent, 0);

  async function handleSave() {
    setError(null);
    setNotice(null);
    if (total !== 100) {
      setError(t.weightsSumError(total));
      return;
    }

    // Saving a term-specific override with no wider default in place
    // means every OTHER term for this class/subject stays unweighted
    // until configured separately — confirm the admin actually wants that.
    if (termId) {
      const wider = await getWeights(params.school, classId, subject || undefined, undefined);
      if (wider.length === 0) {
        const ok = window.confirm(t.confirmNoWiderDefault);
        if (!ok) return;
      }
    }

    try {
      await setWeights(params.school, classId, subject || undefined, termId || undefined, components);
      setNotice(t.savedNotice);
      refreshCoverage();
    } catch {
      setError(t.saveError);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Percent size={20} /> {school.name} — {t.pageTitle}
        </h1>
        <p className="text-sm text-ink/60">{t.description}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <div className="card flex flex-wrap items-end gap-3">
          <select className="rounded border px-2 py-1.5 text-sm" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">{t.selectClass}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="rounded border px-2 py-1.5 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">{t.allSubjectsClassDefault}</option>
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="rounded border px-2 py-1.5 text-sm" value={termId} onChange={(e) => setTermId(e.target.value)}>
            <option value="">{t.allTermsDefault}</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>

        {classId && coverage.length > 0 && (
          <div className="card">
            <p className="mb-2 text-xs font-semibold text-ink/50">
              {t.coveragePrefix(subject ? `— ${subject}` : t.allSubjectsClassDefaultSuffix)}
            </p>
            <div className="flex flex-col gap-1.5">
              {coverage.map((row) => (
                <div key={row.termId} className="flex items-center gap-2 text-sm">
                  <CoverageIcon level={row.level} />
                  <span className="w-40 shrink-0">{row.termName}</span>
                  <span className="text-ink/50">{levelLabel(row.level, t)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {classId && (
          <div className="card">
            <div className="mb-3 flex flex-col gap-2">
              {components.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded border px-2 py-1.5 text-sm"
                    placeholder={t.componentNamePlaceholder}
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
                <Plus size={13} /> {t.addComponentBtn}
              </button>
              <span className={`text-sm font-medium ${total === 100 ? 'text-brand-green' : 'text-red-600'}`}>{t.totalLabel(total)}</span>
            </div>
            <button onClick={handleSave} className="btn-primary">{t.saveWeightingBtn}</button>
          </div>
        )}
      </main>
    </RequireRole>
  );
}
