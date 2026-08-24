// web/app/[school]/admin/academic/classes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses, createClass, assignClassTeacher } from '@/lib/endpoints/classes';
import { listStaff } from '@/lib/endpoints/users';
import { listCatalog, createInCatalog, listForClass, assignToClass, removeFromClass, type Subject, type ClassSubject } from '@/lib/endpoints/subjects';
import {
  listCareerFields,
  addCareerFieldMapping,
  removeCareerFieldMapping,
  type CareerFieldMapping,
} from '@/lib/endpoints/career-fields';
import type { Class, User } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Compass, Trash2 } from 'lucide-react';

export default function ClassesPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');
  const [catalog, setCatalog] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [addSubjectId, setAddSubjectId] = useState('');

  // Career-field mappings power Session Wrap's "suggested fields" — global
  // defaults (Nigeria-flavored) plus whatever this school links on top for
  // subjects its curriculum uses that the defaults don't cover.
  const [careerFields, setCareerFields] = useState<CareerFieldMapping[]>([]);
  const [mappingForm, setMappingForm] = useState({ subject: '', field: '' });

  async function load() {
    try {
      const [c, s, cat, fields] = await Promise.all([
        listClasses(params.school),
        listStaff(params.school),
        listCatalog(params.school),
        listCareerFields(params.school),
      ]);
      setClasses(c);
      setStaff(s);
      setCatalog(cat);
      setCareerFields(fields);
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

  async function handleAddToCatalog(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createInCatalog(params.school, newSubjectName);
      setNewSubjectName('');
      load();
    } catch {
      setError('Could not add subject — it may already exist');
    }
  }

  async function toggleClassSubjects(classId: string) {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }
    setExpandedClassId(classId);
    setClassSubjects(await listForClass(params.school, classId));
  }

  async function handleAssignSubject(classId: string) {
    if (!addSubjectId) return;
    await assignToClass(params.school, classId, addSubjectId);
    setClassSubjects(await listForClass(params.school, classId));
    setAddSubjectId('');
  }

  async function handleRemoveSubject(classId: string, subjectId: string) {
    await removeFromClass(params.school, classId, subjectId);
    setClassSubjects(await listForClass(params.school, classId));
  }

  async function handleAddMapping(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await addCareerFieldMapping(params.school, mappingForm.subject, mappingForm.field.trim());
      setNotice(`Linked "${mappingForm.subject}" → "${mappingForm.field.trim()}" for Session Wrap suggestions.`);
      setMappingForm((f) => ({ ...f, field: '' }));
      load();
    } catch {
      setError('Could not add career field mapping');
    }
  }

  async function handleRemoveMapping(id: string) {
    setError(null);
    try {
      await removeCareerFieldMapping(params.school, id);
      load();
    } catch {
      setError('Could not remove mapping');
    }
  }

  const teacherName = (id: string | null) => staff.find((s) => s.id === id)?.fullName ?? '— unassigned —';
  const globalFields = careerFields.filter((f) => f.schoolId === null);
  const customFields = careerFields.filter((f) => f.schoolId !== null);

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Classes</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <section className="card">
        <h2 className="mb-3 font-medium">Subject catalog</h2>
        <p className="mb-3 text-xs text-ink/50">School-wide list of subjects — add whatever your curriculum uses, there's no fixed set. Assign the relevant ones to each class below.</p>
        <form onSubmit={handleAddToCatalog} className="mb-3 flex items-end gap-2">
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder="e.g. Further Mathematics, Kiswahili, Twi"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary text-sm">
            Add to catalog
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {catalog.map((s) => (
            <span key={s.id} className="badge badge-blue">
              {s.name}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-2 flex items-center gap-2 font-medium">
          <Compass size={16} /> Career field suggestions
        </h2>
        <p className="mb-3 text-xs text-ink/50">
          Powers Session Wrap's "suggested fields" section. The defaults below cover a Nigeria-flavored curriculum —
          link any subject from your catalog above (like the ones you just added) to the career fields it supports,
          and Session Wrap will start suggesting them too.
        </p>

        <form onSubmit={handleAddMapping} className="mb-4 flex flex-wrap items-end gap-2">
          <select
            className="rounded border px-2 py-1.5 text-sm"
            value={mappingForm.subject}
            onChange={(e) => setMappingForm((f) => ({ ...f, subject: e.target.value }))}
            required
          >
            <option value="">Subject</option>
            {catalog.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-ink/40">→</span>
          <input
            className="rounded border px-2 py-1.5 text-sm"
            placeholder="Career field e.g. Linguistics"
            value={mappingForm.field}
            onChange={(e) => setMappingForm((f) => ({ ...f, field: e.target.value }))}
            required
          />
          <button type="submit" className="rounded bg-brand-green px-3 py-1.5 text-sm text-white">
            Link
          </button>
        </form>

        {customFields.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-ink/50">Your school's mappings</p>
            <ul className="flex flex-col gap-1">
              {customFields.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded bg-black/5 px-3 py-1.5 text-sm">
                  <span>
                    {f.subject} → {f.field}
                  </span>
                  <button onClick={() => handleRemoveMapping(f.id)} className="text-ink/40 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-ink/50">Platform defaults ({globalFields.length})</summary>
          <ul className="mt-2 flex flex-col gap-1 text-ink/60">
            {globalFields.map((f) => (
              <li key={f.id}>
                {f.subject} → {f.field}
              </li>
            ))}
          </ul>
        </details>
      </section>

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

      <section className="card">
        <h2 className="mb-3 font-medium">All classes</h2>
        <ul className="flex flex-col gap-3">
          {classes.map((c) => (
            <li key={c.id} className="border-b pb-3 text-sm last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span>
                  <strong>{c.name}</strong> — class teacher: {teacherName(c.classTeacherId)}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleClassSubjects(c.id)} className="text-xs text-brand-blue underline">
                    {expandedClassId === c.id ? 'Hide subjects' : 'Manage subjects'}
                  </button>
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
                </div>
              </div>

              {expandedClassId === c.id && (
                <div className="mt-3 rounded-lg bg-black/5 p-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {classSubjects.length === 0 && <p className="text-xs text-ink/40">No subjects assigned yet.</p>}
                    {classSubjects.map((cs) => (
                      <span key={cs.id} className="badge badge-green flex items-center gap-1.5">
                        {cs.subject.name}
                        <button onClick={() => handleRemoveSubject(c.id, cs.subject.id)} className="hover:text-red-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="rounded border px-2 py-1 text-xs" value={addSubjectId} onChange={(e) => setAddSubjectId(e.target.value)}>
                      <option value="">Add a subject…</option>
                      {catalog
                        .filter((s) => !classSubjects.some((cs) => cs.subject.id === s.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                    <button onClick={() => handleAssignSubject(c.id)} className="btn-secondary text-xs">
                      Add
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  </RequireRole>
);
}