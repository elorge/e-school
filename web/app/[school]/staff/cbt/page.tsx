// web/app/[school]/staff/cbt/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import { Laptop, Clock, Target, FileText, Printer, BarChart3, KeyRound } from 'lucide-react';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents } from '@/lib/endpoints/students';
import { listTerms } from '@/lib/endpoints/terms';
import Link from 'next/link';
import EquationToolbar from '@/components/EquationToolbar';
import ShapeToolbar from '@/components/ShapeToolbar';
import MathText from '@/components/MathText';
import AttemptDetailModal from '@/components/AttemptDetailModal';
import CodeQuestionEditor from '@/components/CodeQuestionEditor';
import ViewScoresModal from '@/components/ViewScoresModal';
import {
  listTests,
  createTest,
  addQuestion,
  publishTest,
  downloadQuestionTemplate,
  bulkUploadQuestions,
  getTest,
  type CbtTest,
} from '@/lib/endpoints/cbt';
import WeightHint from '@/components/WeightHint';
import { fetchTestPaperPdf, openPdfBlob } from '@/lib/endpoints/documents';
import type { Class, Term } from '@/lib/types';
import EditTestModal from '@/components/EditTestModal';
import QuestionsListModal from '@/components/QuestionsListModal';

export default function StaffCbtPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [tests, setTests] = useState<CbtTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<CbtTest | null>(null);
  const [classStudents, setClassStudents] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [viewingAttempt, setViewingAttempt] = useState<{ testId: string; attemptId: string } | null>(null);
  const [viewingScoresFor, setViewingScoresFor] = useState<CbtTest | null>(null);
  const [editingTest, setEditingTest] = useState<CbtTest | null>(null);
  const [viewingQuestionsFor, setViewingQuestionsFor] = useState<CbtTest | null>(null);
  const [activeFieldId, setActiveFieldId] = useState('question-text-input');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED'>('ALL');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const [questionType, setQuestionType] = useState<'OBJECTIVE' | 'CODE'>('OBJECTIVE');

  const filteredTests = statusFilter === 'ALL' ? tests : tests.filter((t) => t.status === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filteredTests.length / PAGE_SIZE));
  const pagedTests = filteredTests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [form, setForm] = useState({
    termId: '',
    classId: '',
    subject: '',
    title: '',
    durationMinutes: 30,
    theoryMaxScore: 0,
    scheduledDate: new Date().toISOString().slice(0, 10),
    countsTowardReport: true,
    componentName: 'Test',
  });
  const [question, setQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: -1, // nothing selected until the teacher explicitly picks one
    points: 1,
  });

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
      setQuestionCount(0);
      const students = await listStudents(params.school, test.classId);
      setClassStudents(students);
      setSelectedStudentIds(new Set(students.map((s) => s.id)));
    } catch {
      setError('Could not create test');
    }
  }

  async function resumeDraftTest(test: CbtTest) {
    setError(null);
    setSelectedTest(test);
    try {
      const [refreshed, students] = await Promise.all([
        getTest(params.school, test.id),
        listStudents(params.school, test.classId),
      ]);
      setQuestionCount(refreshed.questions.length);
      setClassStudents(students);
      setSelectedStudentIds(new Set(students.map((s) => s.id)));
      document.getElementById('add-questions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setError('Could not load this test to continue adding questions');
    }
  }

  /** Card click routes by status: DRAFT resumes question-building, everything else opens the metadata edit modal. */
  function handleCardClick(test: CbtTest) {
    if (test.status === 'DRAFT') {
      resumeDraftTest(test);
    } else {
      setEditingTest(test);
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
    if (question.correctOptionIndex === -1) {
      setError('Select which option is correct before adding the question.');
      return;
    }
    setError(null);
    try {
      await addQuestion(params.school, selectedTest.id, { type: 'OBJECTIVE', ...question });
      setQuestion({ questionText: '', options: ['', '', '', ''], correctOptionIndex: -1, points: 1 });
      setQuestionCount((c) => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add question');
    }
  }

  async function handleAddCodeQuestion(q: {
    starterHtml: string;
    starterCss: string;
    starterJs: string;
    testAssertions: { description: string; assertion: string }[];
    points: number;
    questionText: string;
  }) {
    if (!selectedTest) return;
    setError(null);
    try {
      await addQuestion(params.school, selectedTest.id, { type: 'CODE', ...q });
      setQuestionCount((c) => c + 1);
      setNotice(`Added "${q.questionText.slice(0, 40)}${q.questionText.length > 40 ? '…' : ''}" — ${questionCount + 1} question(s) total.`);
    } catch {
      setError('Could not add code question');
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

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Laptop size={20} /> {school.name} — Computer-Based Tests
        </h1>
        <Link href={`/${params.school}/staff/cbt/take`} className="rounded bg-brand-green px-4 py-2 text-sm text-white">
          Start a test session
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-brand-green">{notice}</p>}

      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 font-medium"><FileText size={16} /> Create a test</h2>
        <form onSubmit={handleCreateTest} className="flex flex-col gap-5">

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Basics</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Title
                <input className="rounded border px-2 py-1.5" placeholder="e.g. Mid-term Objectives" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Subject
                <input className="rounded border px-2 py-1.5" placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Class
                <select className="rounded border px-2 py-1.5" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Term
                <select className="rounded border px-2 py-1.5" value={form.termId} onChange={(e) => setForm((f) => ({ ...f, termId: e.target.value }))} required>
                  <option value="">Select term</option>
                  {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Timing</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Duration (minutes)
                <input className="rounded border px-2 py-1.5" type="number" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Test date
                <input className="rounded border px-2 py-1.5" type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} required />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Scoring &amp; report card</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Theory portion max score <span className="text-ink/40">(0 = objectives only)</span>
                <input className="rounded border px-2 py-1.5" type="number" value={form.theoryMaxScore} onChange={(e) => setForm((f) => ({ ...f, theoryMaxScore: Number(e.target.value) }))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Report card component
                <input className="rounded border px-2 py-1.5" placeholder='e.g. "Test" or "Exam"' value={form.componentName} onChange={(e) => setForm((f) => ({ ...f, componentName: e.target.value }))} />
              </label>
            </div>

            {form.classId && form.subject && <WeightHint school={params.school} classId={form.classId} subject={form.subject} componentName={form.componentName} />}

            <label className="mt-2 flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={form.countsTowardReport} onChange={(e) => setForm((f) => ({ ...f, countsTowardReport: e.target.checked }))} />
              Counts toward the report card {!form.countsTowardReport && <span className="text-ink/40">(practice/mock test — score stays separate)</span>}
            </label>
          </div>

          <button type="submit" className="btn-primary w-fit">Create test</button>
        </form>
      </section>

      {selectedTest && selectedTest.status === 'DRAFT' && (
        <section id="add-questions-section" className="card card-amber">
          <h2 className="mb-3 flex items-center gap-2 font-medium">
            <FileText size={16} /> Add questions to "{selectedTest.title}"
          </h2>

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
              {isUploading ? 'Uploading…' : 'Upload filled-in template'}
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                disabled={isUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  setError(null);
                  setNotice(null);
                  try {
                    const result = await bulkUploadQuestions(params.school, selectedTest.id, file);
                    const refreshed = await getTest(params.school, selectedTest.id);
                    setQuestionCount(refreshed.questions.length);
                    if (result.errors.length > 0) {
                      setError(
                        `Added ${result.addedCount} question(s), now ${refreshed.questions.length} total. ${result.errors.length} row(s) had issues: ${result.errors
                          .map((er) => `row ${er.row} — ${er.reason}`)
                          .join('; ')}`,
                      );
                    } else {
                      setNotice(`Added ${result.addedCount} question(s) — ${refreshed.questions.length} total on this test now.`);
                    }
                  } catch {
                    setError('Upload failed — check the file is a valid .xlsx and try again.');
                  } finally {
                    setIsUploading(false);
                    e.target.value = ''; // allow re-uploading the same filename after a fix
                  }
                }}
              />
            </label>
          </div>
          <p className="mb-2 text-xs text-ink/50">{questionCount} question(s) on this test so far.</p>

          <p className="mb-2 text-xs text-ink/50">Or add one question at a time below:</p>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setQuestionType('OBJECTIVE')}
              className={`rounded-full px-3 py-1.5 ${questionType === 'OBJECTIVE' ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
            >
              Multiple choice
            </button>
            <button
              type="button"
              title="Code challenges are temporarily disabled while a runner bug is fixed"
              onClick={() => setNotice('Code challenge questions are coming soon — temporarily disabled while a bug is fixed.')}
              className="rounded-full bg-black/5 px-3 py-1.5 text-ink/30"
            >
              Code challenge <span className="text-[10px]">(coming soon)</span>
            </button>
          </div>

          {false ? (
            <CodeQuestionEditor onAdd={handleAddCodeQuestion} />
          ) : (
        <div className="grid gap-4 sm:grid-cols-2">
            <form onSubmit={handleAddQuestion} className="flex flex-col gap-2">
            <EquationToolbar targetId={activeFieldId} />
            <ShapeToolbar targetId="question-text-input" />
              <textarea
                id="question-text-input"
                onFocus={() => setActiveFieldId('question-text-input')}
                className="rounded border px-2 py-1.5"
                placeholder="Question text"
                value={question.questionText}
                onChange={(e) => setQuestion((q) => ({ ...q, questionText: e.target.value }))}
                required
              />
              {question.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-2 rounded px-1 py-0.5 ${question.correctOptionIndex === i ? 'bg-brand-green/10' : ''}`}>
                  <label className="flex items-center gap-1 text-xs" title="Mark as correct answer">
                    <input type="radio" checked={question.correctOptionIndex === i} onChange={() => setQuestion((q) => ({ ...q, correctOptionIndex: i }))} />
                  </label>
                  <input
                    id={`option-input-${i}`}
                    className="flex-1 rounded border px-2 py-1"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onFocus={() => setActiveFieldId(`option-input-${i}`)}
                    onChange={(e) =>
                      setQuestion((q) => ({ ...q, options: q.options.map((o, idx) => (idx === i ? e.target.value : o)) }))
                    }
                    required
                  />
                  {question.correctOptionIndex === i && <span className="text-xs font-medium text-brand-green">Correct</span>}
                </div>
              ))}
              <p className="text-xs text-ink/40">
                Symbol buttons insert into whichever field you last clicked into — question text or any option. Shape
                buttons always insert into the question text. Typing $...$ directly also works, including when filling
                in the bulk-upload Excel template offline. Select the radio button next to an option to mark it as the
                correct answer.
              </p>
              <label className="flex w-24 flex-col gap-1 text-xs text-ink/60">
                Add point
                <input
                  className="rounded border px-2 py-1 text-sm text-ink"
                  type="number"
                  min={1}
                  value={question.points}
                  onChange={(e) => setQuestion((q) => ({ ...q, points: Number(e.target.value) }))}
                />
              </label>
              <button type="submit" className="w-fit rounded bg-brand-green px-3 py-1.5 text-sm text-white">
                Add question
              </button>
            </form>

            <div className="rounded-lg border-2 border-dashed p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-ink/40">Live preview — what the student sees</p>
              <p className="mb-3 font-medium">
                {question.questionText ? <MathText text={question.questionText} /> : 'Your question text will appear here…'}
              </p>
              <div className="flex flex-col gap-2">
                {question.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input type="radio" disabled checked={question.correctOptionIndex === i} readOnly />
                    {opt ? <MathText text={opt} /> : <span className="text-ink/30">Option {i + 1}</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>
          )}
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

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">All tests ({filteredTests.length})</h2>
          <div className="flex gap-1 text-xs">
            {(['ALL', 'DRAFT', 'PUBLISHED', 'CLOSED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setStatusFilter(f);
                  setPage(1);
                }}
                className={`rounded-full px-2.5 py-1 ${statusFilter === f ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pagedTests.map((t) => (
            <div
              key={t.id}
              onClick={() => handleCardClick(t)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(t);
              }}
              className={`card cursor-pointer transition-shadow hover:shadow-md ${
                t.status === 'PUBLISHED' ? 'card-green' : t.status === 'DRAFT' ? 'card-amber' : 'card-blue'
              } !p-4`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-ink/50">{t.subject}</p>
                </div>
                <span
                  className={`badge ${
                    t.status === 'PUBLISHED' ? 'badge-green' : t.status === 'DRAFT' ? 'badge-amber' : 'badge-gray'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {t.durationMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Target size={12} /> {t.objectiveMaxScore} pts
                </span>
                {t.theoryMaxScore > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> +{t.theoryMaxScore} theory
                  </span>
                )}
                {t.status === 'DRAFT' && (
                  <span className="flex items-center gap-1 font-medium text-brand-blue">
                    <FileText size={12} /> Click to continue adding questions →
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 border-t pt-3 text-xs">
                <button
                  className="flex items-center gap-1 text-brand-blue hover:underline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    openPdfBlob(await fetchTestPaperPdf(params.school, t.id));
                  }}
                >
                  <Printer size={13} /> Print paper
                </button>
                <button
                  className="flex items-center gap-1 text-brand-blue hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingQuestionsFor(t);
                  }}
                >
                  <FileText size={13} /> Questions
                </button>
                {t.status !== 'DRAFT' && (
                  <button
                    className="flex items-center gap-1 text-brand-blue hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingScoresFor(t);
                    }}
                  >
                    <BarChart3 size={13} /> View scores
                  </button>
                )}
                {t.status === 'PUBLISHED' && t.accessCode && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 font-mono text-ink/60">
                    <KeyRound size={12} /> {t.accessCode}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">
              Previous
            </button>
            <span className="text-ink/50">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">
              Next
            </button>
          </div>
        )}
      </section>

      {viewingScoresFor && (
        <ViewScoresModal
          school={params.school}
          test={viewingScoresFor}
          onClose={() => setViewingScoresFor(null)}
          onViewAttempt={(attemptId) => setViewingAttempt({ testId: viewingScoresFor.id, attemptId })}
        />
      )}

      {viewingAttempt && (
        <AttemptDetailModal
          school={params.school}
          testId={viewingAttempt.testId}
          attemptId={viewingAttempt.attemptId}
          onClose={() => setViewingAttempt(null)}
        />
      )}

      {editingTest && (
        <EditTestModal
          school={params.school}
          test={editingTest}
          onClose={() => setEditingTest(null)}
          onSaved={(updated) => {
            setTests((ts) => ts.map((x) => (x.id === updated.id ? updated : x)));
            if (selectedTest?.id === updated.id) setSelectedTest(updated);
          }}
        />
      )}

      {viewingQuestionsFor && (
        <QuestionsListModal
          school={params.school}
          test={viewingQuestionsFor}
          onClose={() => setViewingQuestionsFor(null)}
          onQuestionsChanged={(count) => {
            if (selectedTest?.id === viewingQuestionsFor.id) setQuestionCount(count);
          }}
        />
      )}
    </main>
  );
}