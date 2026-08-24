// web/app/[school]/admin/settings/subjects/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listCatalog, createInCatalog, removeFromCatalog, type Subject } from '@/lib/endpoints/subjects';
import {
  listCareerFields,
  addCareerFieldMapping,
  removeCareerFieldMapping,
  type CareerFieldMapping,
} from '@/lib/endpoints/career-fields';
import RequireRole from '@/components/RequireRole';
import LoadingScreen from '@/components/LoadingScreen';
import { BookOpen, Compass, Trash2 } from 'lucide-react';

export default function SubjectsSettingsPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [fields, setFields] = useState<CareerFieldMapping[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [mappingForm, setMappingForm] = useState({ subject: '', field: '' });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    try {
      const [s, f] = await Promise.all([listCatalog(params.school), listCareerFields(params.school)]);
      setSubjects(s);
      setFields(f);
    } catch {
      setError('Failed to load subjects and career fields');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await createInCatalog(params.school, newSubject.trim());
      setNewSubject('');
      setNotice(`"${newSubject.trim()}" added to your subject catalog.`);
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Could not add subject — it may already exist.');
    }
  }

  async function handleRemoveSubject(subjectId: string, name: string) {
    setError(null);
    try {
      await removeFromCatalog(params.school, subjectId);
      setNotice(`Removed "${name}" and its class assignments.`);
      load();
    } catch {
      setError('Could not remove subject');
    }
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

  if (isLoading) return <LoadingScreen />;

  // Global defaults (schoolId: null) can't be deleted from here — only shown for context.
  const globalFields = fields.filter((f) => f.schoolId === null);
  const customFields = fields.filter((f) => f.schoolId !== null);

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <BookOpen size={20} /> {school.name} — Subjects
        </h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <section className="card">
          <h2 className="mb-2 font-medium">Subject catalog</h2>
          <p className="mb-3 text-xs text-ink/50">
            Your school's own list — not shared with any other school. Add whatever your curriculum uses; there's no
            fixed set.
          </p>
          <ul className="mb-4 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-sm">
                {s.name}
                <button
                  title="Remove subject"
                  onClick={() => handleRemoveSubject(s.id, s.name)}
                  className="text-ink/40 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
            {subjects.length === 0 && <p className="text-sm text-ink/40">No subjects added yet.</p>}
          </ul>
          <form onSubmit={handleAddSubject} className="flex items-end gap-2">
            <input
              className="rounded border px-2 py-1.5 text-sm"
              placeholder="e.g. Kiswahili, Twi, Further Maths"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
            <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
              Add subject
            </button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-2 flex items-center gap-2 font-medium">
            <Compass size={16} /> Career field suggestions
          </h2>
          <p className="mb-3 text-xs text-ink/50">
            Powers the "suggested fields" section of Session Wrap. The defaults below cover a Nigeria-flavored
            curriculum — link any subject your school teaches (like the ones you just added above) to the career
            fields it supports, and Session Wrap will start suggesting them too.
          </p>

          <form onSubmit={handleAddMapping} className="mb-4 flex flex-wrap items-end gap-2">
            <select
              className="rounded border px-2 py-1.5 text-sm"
              value={mappingForm.subject}
              onChange={(e) => setMappingForm((f) => ({ ...f, subject: e.target.value }))}
              required
            >
              <option value="">Subject</option>
              {subjects.map((s) => (
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
      </main>
    </RequireRole>
  );
}