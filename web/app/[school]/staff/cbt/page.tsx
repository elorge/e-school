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
import { staffCbtLabelsFor } from '@/lib/i18n/staff-cbt-labels';
import type { Class, Term } from '@/lib/types';
import EditTestModal from '@/components/EditTestModal';
import QuestionsListModal from '@/components/QuestionsListModal';

export default function StaffCbtPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = staffCbtLabelsFor(school.locale);
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

  const filteredTests = statusFilter === 'ALL' ? tests : tests.filter((x) => x.status === statusFilter);
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
      .then(([c, terms, ts]) => {
        setClasses(c);
        setTerms(terms);
        setTests(ts);
      })
      .catch(() => setError(t.loadSetupDataFailed))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.school]);

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const test = await createTest(params.school, form);
      setTests((prev) => [test, ...prev]);
      setSelectedTest(test);
      setQuestionCount(0);
      const students = await listStudents(params.school, test.classId);
      setClassStudents(students);
      setSelectedStudentIds(new Set(students.map((s) => s.id)));
    } catch {
      setError(t.couldNotCreateTest);
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
      setError(t.couldNotResumeTest);
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
      setError(t.selectCorrectOptionError);
      return;
    }
    setError(null);
    try {
      await addQuestion(params.school, selectedTest.id, { type: 'OBJECTIVE', ...question });
      setQuestion({ questionText: '', options: ['', '', '', ''], correctOptionIndex: -1, points: 1 });
      setQuestionCount((c) => c + 1);
    } catch (err) {
      setError(t.couldNotAddQuestion);
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
      setNotice(t.addedCodeQuestionNotice(`${q.questionText.slice(0, 40)}${q.questionText.length > 40 ? '…' : ''}`, questionCount + 1));
    } catch {
      setError(t.couldNotAddCodeQuestion);
    }
  }

  async function handlePublish() {
    if (!selectedTest) return;
    setError(null);
    try {
      const updated = await publishTest(params.school, selectedTest.id, Array.from(selectedStudentIds));
      setSelectedTest(updated);
      setTests((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      const scheduledLabel = new Date(updated.scheduledDate).toDateString();
      setNotice(
        t.publishedNotice(scheduledLabel, updated.accessCode ?? '', `${window.location.origin}/${params.school}/cbt/login`),
      );
    } catch (err: any) {
      setError(t.couldNotPublish);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Laptop size={20} /> {school.name} — {t.pageTitle}
        </h1>
        <Link href={`/${params.school}/staff/cbt/take`} className="rounded bg-brand-green px-4 py-2 text-sm text-white">
          {t.startTestSessionBtn}
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-brand-green">{notice}</p>}

      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 font-medium"><FileText size={16} /> {t.createTestHeading}</h2>
        <form onSubmit={handleCreateTest} className="flex flex-col gap-5">

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{t.basicsLabel}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                {t.titleLabel}
                <input className="rounded border px-2 py-1.5" placeholder={t.titlePlaceholder} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t.subjectLabel}
                <input className="rounded border px-2 py-1.5" placeholder={t.subjectPlaceholder} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t.classLabel}
                <select className="rounded border px-2 py-1.5" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
                  <option value="">{t.selectClass}</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t.termLabel}
                <select className="rounded border px-2 py-1.5" value={form.termId} onChange={(e) => setForm((f) => ({ ...f, termId: e.target.value }))} required>
                  <option value="">{t.selectTerm}</option>
                  {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{t.timingLabel}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                {t.durationLabel}
                <input className="rounded border px-2 py-1.5" type="number" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} required />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t.testDateLabel}
                <input className="rounded border px-2 py-1.5" type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} required />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{t.scoringLabel}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                {t.theoryMaxScoreLabel} <span className="text-ink/40">{t.objectivesOnlyHint}</span>
                <input className="rounded border px-2 py-1.5" type="number" value={form.theoryMaxScore} onChange={(e) => setForm((f) => ({ ...f, theoryMaxScore: Number(e.target.value) }))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t.reportCardComponentLabel}
                <input className="rounded border px-2 py-1.5" placeholder={t.reportCardComponentPlaceholder} value={form.componentName} onChange={(e) => setForm((f) => ({ ...f, componentName: e.target.value }))} />
              </label>
            </div>

            {form.classId && form.subject && <WeightHint school={params.school} classId={form.classId} subject={form.subject} componentName={form.componentName} />}

            <label className="mt-2 flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={form.countsTowardReport} onChange={(e) => setForm((f) => ({ ...f, countsTowardReport: e.target.checked }))} />
              {t.countsTowardReport} {!form.countsTowardReport && <span className="text-ink/40">{t.practiceHint}</span>}
            </label>
          </div>

          <button type="submit" className="btn-primary w-fit">{t.createTestBtn}</button>
        </form>
      </section>

      {selectedTest && selectedTest.status === 'DRAFT' && (
        <section id="add-questions-section" className="card card-amber">
          <h2 className="mb-3 flex items-center gap-2 font-medium">
            <FileText size={16} /> {t.addQuestionsHeading(selectedTest.title)}
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
              {t.downloadQuestionTemplateBtn}
            </button>
            <span className="text-ink/40">{t.orText}</span>
          <label className="cursor-pointer text-brand-blue underline">
              {isUploading ? t.uploadingBtn : t.uploadFilledTemplateBtn}
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
                        t.uploadAddedWithIssues(
                          result.addedCount,
                          refreshed.questions.length,
                          `${result.errors.length} row(s) had issues: ${result.errors
                            .map((er) => `row ${er.row} — ${er.reason}`)
                            .join('; ')}`,
                        ),
                      );
                    } else {
                      setNotice(t.uploadAddedSimple(result.addedCount, refreshed.questions.length));
                    }
                  } catch {
                    setError(t.uploadFailedError);
                  } finally {
                    setIsUploading(false);
                    e.target.value = ''; // allow re-uploading the same filename after a fix
                  }
                }}
              />
            </label>
          </div>
          <p className="mb-2 text-xs text-ink/50">{t.questionsOnTestSoFar(questionCount)}</p>

          <p className="mb-2 text-xs text-ink/50">{t.orAddOneAtATime}</p>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setQuestionType('OBJECTIVE')}
              className={`rounded-full px-3 py-1.5 ${questionType === 'OBJECTIVE' ? 'bg-brand-blue text-white' : 'bg-black/5 text-ink/60'}`}
            >
              {t.multipleChoiceBtn}
            </button>
            <button
              type="button"
              title={t.codeChallengeDisabledTitle}
              onClick={() => setNotice(t.codeChallengeComingSoonNotice)}
              className="rounded-full bg-black/5 px-3 py-1.5 text-ink/30"
            >
              {t.codeChallengeBtn} <span className="text-[10px]">{t.codeChallengeComingSoon}</span>
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
                placeholder={t.questionTextPlaceholder}
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
                    placeholder={t.optionPlaceholder(i + 1)}
                    value={opt}
                    onFocus={() => setActiveFieldId(`option-input-${i}`)}
                    onChange={(e) =>
                      setQuestion((q) => ({ ...q, options: q.options.map((o, idx) => (idx === i ? e.target.value : o)) }))
                    }
                    required
                  />
                  {question.correctOptionIndex === i && <span className="text-xs font-medium text-brand-green">{t.correctLabel}</span>}
                </div>
              ))}
              <p className="text-xs text-ink/40">{t.toolbarHelp}</p>
              <label className="flex w-24 flex-col gap-1 text-xs text-ink/60">
                {t.addPointLabel}
                <input
                  className="rounded border px-2 py-1 text-sm text-ink"
                  type="number"
                  min={1}
                  value={question.points}
                  onChange={(e) => setQuestion((q) => ({ ...q, points: Number(e.target.value) }))}
                />
              </label>
              <button type="submit" className="w-fit rounded bg-brand-green px-3 py-1.5 text-sm text-white">
                {t.addQuestionBtn}
              </button>
            </form>

            <div className="overflow-hidden rounded border border-[#C7CDD1] bg-white">
              <div className="flex items-center justify-between border-b border-[#C7CDD1] bg-[#F5F5F5] px-4 py-2.5">
                <p className="font-semibold text-[#2D3B45]">{t.questionCardTitle(questionCount + 1)}</p>
                <p className="text-sm text-[#6B7780]">
                  {question.points} {question.points !== 1 ? t.points : t.point}
                </p>
              </div>

              <div className="px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-ink/40">{t.livePreviewLabel}</p>
                <p className="mb-4 mt-2 text-[#2D3B45]">
                  {question.questionText ? (
                    <MathText text={question.questionText} />
                  ) : (
                    <span className="text-ink/30">{t.questionTextPlaceholderPreview}</span>
                  )}
                </p>

                <div className="flex flex-col gap-1">
                  {question.options.map((opt, i) => {
                    const markedCorrect = question.correctOptionIndex === i;
                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-3 rounded border px-3 py-2.5 text-sm ${
                          markedCorrect ? 'border-[#137CBD] bg-[#137CBD]/5' : 'border-transparent'
                        }`}
                      >
                        <input type="radio" disabled checked={markedCorrect} readOnly className="h-4 w-4 accent-[#137CBD]" />
                        {opt ? <MathText text={opt} /> : <span className="text-ink/30">{t.optionFallback(i + 1)}</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          )}
          {classStudents.length > 0 && (
            <div className="mt-4 rounded border p-3">
              <p className="mb-2 text-sm font-medium">{t.assignToLabel(selectedStudentIds.size, classStudents.length)}</p>
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
            {t.publishBtn(selectedStudentIds.size)}
          </button>
        </section>
      )}

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">{t.allTestsHeading(filteredTests.length)}</h2>
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
                {f === 'ALL' ? t.filterAll : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pagedTests.map((test) => (
            <div
              key={test.id}
              onClick={() => handleCardClick(test)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(test);
              }}
              className={`card cursor-pointer transition-shadow hover:shadow-md ${
                test.status === 'PUBLISHED' ? 'card-green' : test.status === 'DRAFT' ? 'card-amber' : 'card-blue'
              } !p-4`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-medium">{test.title}</p>
                  <p className="text-xs text-ink/50">{test.subject}</p>
                </div>
                <span
                  className={`badge ${
                    test.status === 'PUBLISHED' ? 'badge-green' : test.status === 'DRAFT' ? 'badge-amber' : 'badge-gray'
                  }`}
                >
                  {test.status}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {test.durationMinutes} {t.minutesAbbrev}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={12} /> {test.objectiveMaxScore} {t.ptsAbbrev}
                </span>
                {test.theoryMaxScore > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {t.theoryAbbrev(test.theoryMaxScore)}
                  </span>
                )}
                {test.status === 'DRAFT' && (
                  <span className="flex items-center gap-1 font-medium text-brand-blue">
                    <FileText size={12} /> {t.clickToContinue}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 border-t pt-3 text-xs">
                <button
                  className="flex items-center gap-1 text-brand-blue hover:underline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    openPdfBlob(await fetchTestPaperPdf(params.school, test.id));
                  }}
                >
                  <Printer size={13} /> {t.printPaperBtn}
                </button>
                <button
                  className="flex items-center gap-1 text-brand-blue hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingQuestionsFor(test);
                  }}
                >
                  <FileText size={13} /> {t.questionsBtn}
                </button>
                {test.status !== 'DRAFT' && (
                  <button
                    className="flex items-center gap-1 text-brand-blue hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingScoresFor(test);
                    }}
                  >
                    <BarChart3 size={13} /> {t.viewScoresBtn}
                  </button>
                )}
                {test.status === 'PUBLISHED' && test.accessCode && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 font-mono text-ink/60">
                    <KeyRound size={12} /> {test.accessCode}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">
              {t.previousBtn}
            </button>
            <span className="text-ink/50">{t.pageOf(page, totalPages)}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">
              {t.nextBtn}
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
