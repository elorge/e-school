// web/app/[school]/admin/academic/classes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses, createClass, assignClassTeacher } from '@/lib/endpoints/classes';
import { listStaff } from '@/lib/endpoints/users';
import type { Class, User } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';

export default function ClassesPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');

  async function load() {
    try {
      const [c, s] = await Promise.all([listClasses(params.school), listStaff(params.school)]);
      setClasses(c);
      setStaff(s);
    } catch {
      setError('Failed to load classes/staff');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createClass(params.school, newClassName, newClassTeacherId || undefined);
      setNewClassName('');
      setNewClassTeacherId('');
      load();
    } catch {
      setError('Could not create class');
    }
  }

  async function handleAssign(classId: string, teacherId: string) {
    if (!teacherId) return;
    setError(null);
    setNotice(null);
    try {
      await assignClassTeacher(params.school, classId, teacherId);
      setNotice('Class teacher updated.');
      load();
    } catch {
      setError('Could not assign teacher');
    }
  }

  const teacherName = (id: string | null) => staff.find((s) => s.id === id)?.fullName ?? '— unassigned —';

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Classes</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Create a class</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Class name
            <input
              className="rounded border px-2 py-1.5"
              placeholder="JSS 2"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Class teacher (optional — can assign later)
            <select className="rounded border px-2 py-1.5" value={newClassTeacherId} onChange={(e) => setNewClassTeacherId(e.target.value)}>
              <option value="">— unassigned —</option>
              {staff.filter((s) => s.role === 'STAFF').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            Create class
          </button>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">All classes</h2>
        <ul className="flex flex-col gap-3">
          {classes.map((c) => (
            <li key={c.id} className="flex items-center justify-between border-b pb-3 text-sm last:border-b-0 last:pb-0">
              <span>
                <strong>{c.name}</strong> — class teacher: {teacherName(c.classTeacherId)}
              </span>
              <select
                className="rounded border px-2 py-1 text-xs"
                defaultValue=""
                onChange={(e) => handleAssign(c.id, e.target.value)}
              >
                <option value="" disabled>
                  Reassign teacher…
                </option>
                {staff.filter((s) => s.role === 'STAFF').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}