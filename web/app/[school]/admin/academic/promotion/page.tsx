// web/app/[school]/admin/academic/promotion/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { apiFetch } from '@/lib/api';
import { promotionLabelsFor } from '@/lib/i18n/promotion-labels';
import type { Class, Student } from '@/lib/types';
import RequireRole from '@/components/RequireRole';
import LoadingScreen from '@/components/LoadingScreen';
import { ArrowRight } from 'lucide-react';

export default function PromotionPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = promotionLabelsFor(school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [fromClassId, setFromClassId] = useState('');
  const [toClassId, setToClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listClasses(params.school).then(setClasses).finally(() => setIsLoading(false));
  }, [params.school]);

  useEffect(() => {
    if (fromClassId) {
      listStudents(params.school, fromClassId).then((s) => {
        const active = s.filter((x) => x.status === 'ACTIVE');
        setStudents(active);
        setSelected(new Set(active.map((s) => s.id)));
      });
    }
  }, [fromClassId, params.school]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handlePromote() {
    setError(null);
    setNotice(null);
    if (!toClassId || selected.size === 0) {
      setError(t.chooseTargetError);
      return;
    }
    try {
      const result = await apiFetch<{ promoted: number }>(`/${params.school}/classes/promote`, {
        method: 'POST',
        body: JSON.stringify({ toClassId, studentIds: Array.from(selected) }),
      });
      setNotice(t.promotedNotice(result.promoted));
      listStudents(params.school, fromClassId).then((s) => setStudents(s.filter((x) => x.status === 'ACTIVE')));
    } catch {
      setError(t.couldNotPromote);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">{school.name} — {t.pageTitle}</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <div className="card flex flex-wrap items-center gap-3">
          <select className="rounded border px-2 py-1.5 text-sm" value={fromClassId} onChange={(e) => setFromClassId(e.target.value)}>
            <option value="">{t.fromClass}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ArrowRight size={16} className="text-ink/40" />
          <select className="rounded border px-2 py-1.5 text-sm" value={toClassId} onChange={(e) => setToClassId(e.target.value)}>
            <option value="">{t.toClass}</option>
            {classes.filter((c) => c.id !== fromClassId).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {students.length > 0 && (
          <div className="card">
            <ul className="mb-3 flex flex-col gap-1">
              {students.map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                    {s.firstName} {s.lastName}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={handlePromote} className="btn-primary">
              {t.promoteBtn(selected.size)}
            </button>
          </div>
        )}
      </main>
    </RequireRole>
  );
}
