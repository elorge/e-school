// web/app/[school]/admin/pins/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { listTerms } from '@/lib/endpoints/terms';
import { getPricing, generatePins } from '@/lib/endpoints/pin-generation';
import type { Class, Term, Student } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import { KeyRound, Printer } from 'lucide-react';
import RequireRole from '@/components/RequireRole';

export default function PinGenerationPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classId, setClassId] = useState('');
  const [termId, setTermId] = useState('');
  const [pricePerStudentKobo, setPricePerStudentKobo] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState<{ studentId: string; plaintextPin: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    Promise.all([listClasses(params.school), listTerms(params.school), getPricing(params.school)])
      .then(([c, t, p]) => {
        setClasses(c);
        setTerms(t);
        setPricePerStudentKobo(p.pricePerStudentKobo);
      })
      .finally(() => setIsLoading(false));
  }, [params.school]);

  useEffect(() => {
    if (classId) listStudents(params.school, classId).then((s) => setStudents(s.filter((x) => x.status === 'ACTIVE')));
  }, [classId, params.school]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(students.map((s) => s.id)));
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    try {
      const result = await generatePins(params.school, {
        termId,
        studentIds: Array.from(selectedIds),
        pricePerStudentKobo,
        idempotencyKey: crypto.randomUUID(),
      });
      setGenerated(result);
    } catch (err: any) {
      setError(err?.message ?? 'Could not generate PINs — check wallet balance');
    } finally {
      setIsGenerating(false);
    }
  }

  const totalCost = selectedIds.size * pricePerStudentKobo;
  const studentName = (id: string) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  if (isLoading) return <LoadingScreen />;

  if (generated.length > 0) {
    return (
      <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-4">
        <div className="flex items-center justify-between print:hidden">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <KeyRound size={20} /> PINs generated
          </h1>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-1.5">
            <Printer size={15} /> Print sheet
          </button>
        </div>
        <p className="text-sm text-amber print:hidden">
          These PINs are shown once and never stored in plaintext or emailed — write them down or print this page now.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Student</th>
              <th className="py-2">Admission ID / PIN</th>
            </tr>
          </thead>
          <tbody>
            {generated.map((g) => (
              <tr key={g.studentId} className="border-b">
                <td className="py-2">{studentName(g.studentId)}</td>
                <td className="py-2 font-mono">{g.plaintextPin}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setGenerated([])} className="btn-secondary w-fit print:hidden">
          Generate another batch
        </button>
      </main>
      </RequireRole>
    );
  }

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <KeyRound size={20} /> {school.name} — Generate Result PINs
      </h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card flex flex-wrap items-end gap-3">
        <select className="rounded border px-2 py-1.5 text-sm" value={termId} onChange={(e) => setTermId(e.target.value)}>
          <option value="">Term</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select className="rounded border px-2 py-1.5 text-sm" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {students.length > 0 && (
          <button onClick={selectAll} className="btn-secondary text-xs">
            Select all ({students.length})
          </button>
        )}
      </div>

      {students.length > 0 && (
        <div className="card">
          <ul className="flex flex-col gap-1">
            {students.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggle(s.id)} />
                  {s.firstName} {s.lastName} — {s.studentId ?? 'pending ID'}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedIds.size > 0 && termId && (
        <div className="stat-hero">
          <p className="text-sm text-white/70">
            {selectedIds.size} student(s) selected — students already charged for this term (via PIN or CBT) are not
            billed again.
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">Up to ₦{(totalCost / 100).toLocaleString('en-NG')}</p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary relative mt-4 bg-white text-brand-blue hover:bg-white/90 disabled:opacity-50"
          >
            {isGenerating ? 'Generating…' : 'Generate PINs'}
          </button>
        </div>
      )}
    </main>
    </RequireRole>
  );
}