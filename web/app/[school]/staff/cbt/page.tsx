// web/app/[school]/staff/cbt/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { listTerms } from '@/lib/endpoints/terms';
import Link from 'next/link';
import {
  listTests,
  createTest,
  addQuestion,
  publishTest,
  listAttempts,
  gradeTheory,
  downloadQuestionTemplate,
  bulkUploadQuestions,
  type CbtTest,
} from '@/lib/endpoints/cbt';
import type { Class, Term } from '@/lib/types';

export default function StaffCbtPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [tests, setTests] = useState<CbtTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<CbtTest | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    termId: '',
    classId: '',
    subject: '',
    title: '',
    durationMinutes: 30,
    theoryMaxScore: 0,
    scheduledDate: new Date().toISOString().slice(0, 10),
  });
  const [question, setQuestion] = useState({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 });

  useEffect(() => {
    Promise.all([listClasses(params.school), listTerms(params.school), listTests(params.school)])
      .then(([c, t, ts]) => {
        setClasses(c);
        setTerms(t);
        setTests(ts);
      })
      .catch(() => setError('Failed to load setup data'))
      .finally(() => setIsLoading(false));
  }, [params.school]);

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const test = await createTest(params.school, form);
      setTests((t) => [test, ...t]);
      setSelectedTest(test);
      const students = await listStudents(params.school, test.classId);
      setClassStudents(students);
      setSelectedStudentIds(new Set(students.map((s) => s.id))); // default: everyone in the class selected
    } catch {
      setError('Could not create test');
    }
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTest) return;
    setError(null);
    try {
      await addQuestion(params.school, selectedTest.id, question);
      setQuestion({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 });
    } catch {
      setError('Could not add question');
    }
  }

  async function handlePublish() {
    if (!selectedTest) return;
    setError(null);
    try {
      const updated = await publishTest(params.school, selectedTest.id, Array.from(selectedStudentIds));
      setSelectedTest(updated);
      setTests((t) => t.map((x) => (x.id === updated.id ? updated : x)));
      const scheduledLabel = new Date(updated.scheduledDate).toDateString();
      setNotice(
        `Published for ${scheduledLabel}. Access code: ${updated.accessCode} — write this on the board that day. Students self-serve at ${window.location.origin}/${params.school}/cbt/login. The code will stop working outside that day's window.`,
      );
    } catch (err: any) {
      setError(err?.message ?? 'Could not publish — check wallet balance and that questions exist');
    }
  }

  async function loadAttempts(test: CbtTest) {
    setSelectedTest(test);
    const data = await listAttempts(params.school, test.id);
    setAttempts(data);
  }

  async function handleGradeTheory(attemptId: string, value: string) {
    await gradeTheory(params.school, attemptId, Number(value));
    if (selectedTest) loadAttempts(selectedTest);
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{school.name} — Computer-Based Tests</h1>
        <Link href={`/${params.school}/staff/cbt/take`} className="rounded bg-brand-green px-4 py-2 text-sm text-white">
          Start a test session
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-brand-green">{notice}</p>}

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Create a test</h2>
        <form onSubmit={handleCreateTest} className="flex flex-wrap items-end gap-2">
          <select className="rounded border px-2 py-1.5" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
            <option value="">Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="rounded border px-2 py-1.5" value={form.termId} onChange={(e) => setForm((f) => ({ ...f, termId: e.target.value }))} required>
            <option value="">Term</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input className="rounded border px-2 py-1.5" placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required />
          <input className="rounded border px-2 py-1.5" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <input
            className="w-24 rounded border px-2 py-1.5"
            type="number"
            placeholder="Minutes"
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            required
          />
          <label className="flex flex-col text-xs">
            Test date
            <input
              className="rounded border px-2 py-1.5"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col text-xs">
            Theory max (0 = objectives only)
            <input
              className="w-28 rounded border px-2 py-1.5"
              type="number"
              value={form.theoryMaxScore}
              onChange={(e) => setForm((f) => ({ ...f, theoryMaxScore: Number(e.target.value) }))}
            />
          </label>
          <button type="submit" className="rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            Create
          </button>
        </form>
      </section>

      {selectedTest && selectedTest.status === 'DRAFT' && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Add questions to "{selectedTest.title}"</h2>

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded bg-black/5 p-3 text-sm">
            <button
              onClick={async () => {
                const blob = await downloadQuestionTemplate(params.school, selectedTest.id);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedTest.title}-template.xlsx`;
                a.click();
              }}
              className="text-brand-blue underline"
            >
              Download question template (.xlsx)
            </button>
            <span className="text-ink/40">or</span>
            <label className="cursor-pointer text-brand-blue underline">
              Upload filled-in template
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const result = await bulkUploadQuestions(params.school, selectedTest.id, file);
                  setError(
                    result.errors.length > 0
                      ? `Added ${result.addedCount} question(s). ${result.errors.length} row(s) had issues: ${result.errors
                          .map((er) => `row ${er.row} — ${er.reason}`)
                          .join('; ')}`
                      : null,
                  );
                }}
              />
            </label>
          </div>

          <p className="mb-2 text-xs text-ink/50">Or add one question at a time below:</p>
          <form onSubmit={handleAddQuestion} className="flex flex-col gap-2">
            <input
              className="rounded border px-2 py-1.5"
              placeholder="Question text"
              value={question.questionText}
              onChange={(e) => setQuestion((q) => ({ ...q, questionText: e.target.value }))}
              required
            />
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" checked={question.correctOptionIndex === i} onChange={() => setQuestion((q) => ({ ...q, correctOptionIndex: i }))} />
                <input
                  className="flex-1 rounded border px-2 py-1"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) =>
                    setQuestion((q) => ({ ...q, options: q.options.map((o, idx) => (idx === i ? e.target.value : o)) }))
                  }
                  required
                />
              </div>
            ))}
            <input
              className="w-24 rounded border px-2 py-1"
              type="number"
              placeholder="Points"
              value={question.points}
              onChange={(e) => setQuestion((q) => ({ ...q, points: Number(e.target.value) }))}
            />
            <button type="submit" className="w-fit rounded bg-brand-green px-3 py-1.5 text-sm text-white">
              Add question
            </button>
          </form>
          {classStudents.length > 0 && (
            <div className="mt-4 rounded border p-3">
              <p className="mb-2 text-sm font-medium">
                Assign to ({selectedStudentIds.size} of {classStudents.length} selected — only selected students are charged
                and get an attempt)
              </p>
              <div className="flex flex-col gap-1">
                {classStudents.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedStudentIds.has(s.id)} onChange={() => toggleStudent(s.id)} />
                    {s.firstName} {s.lastName}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button onClick={handlePublish} className="mt-4 rounded bg-brand-blue px-3 py-1.5 text-sm text-white">
            Publish test (debits wallet for {selectedStudentIds.size} selected student(s))
          </button>
        </section>
      )}

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">All tests</h2>
        <ul className="flex flex-col gap-1">
          {tests.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-sm">
              <span>
                {t.title} — {t.subject} ({t.status})
              </span>
              {t.status !== 'DRAFT' && (
                <button className="text-brand-blue underline" onClick={() => loadAttempts(t)}>
                  View scores
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {attempts.length > 0 && selectedTest && (
        <section className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Scores — {selectedTest.title}</h2>
          <ul className="flex flex-col gap-2">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>
                  {a.student.firstName} {a.student.lastName} — Objective: {a.objectiveScore ?? '—'}/{selectedTest.objectiveMaxScore}
                </span>
                {selectedTest.theoryMaxScore > 0 && a.status !== 'IN_PROGRESS' && (
                  <input
                    className="w-20 rounded border px-2 py-1 text-xs"
                    type="number"
                    placeholder={`/${selectedTest.theoryMaxScore}`}
                    defaultValue={a.theoryScore ?? ''}
                    onBlur={(e) => e.target.value && handleGradeTheory(a.id, e.target.value)}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}