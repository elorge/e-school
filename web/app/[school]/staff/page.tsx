// web/app/[school]/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { getSessionUser } from '@/lib/session';
import { listClasses } from '@/lib/endpoints/classes';
import {
  listStudents,
  registerStudent,
  withdrawStudent,
  downloadStudentImportTemplate,
  bulkImportStudents,
  getPendingStudentsCount,
  getStuckStudentsCount,
  syncQueuedStudents,
} from '@/lib/endpoints/students';
import { uploadStudentPhoto } from '@/lib/endpoints/uploads';
import { listTerms } from '@/lib/endpoints/terms';
import { getPendingResultsCount, getStuckResultsCount, syncQueuedResults } from '@/lib/endpoints/results';
import CameraCapture from '@/components/CameraCapture';
import ResultEntryModal from '@/components/ResultEntryModal';
import { FileEdit, ImagePlus, Camera, UserMinus, RefreshCw, CheckCircle2 } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import { staffRosterLabelsFor } from '@/lib/i18n/staff-roster-labels';
import type { Class, Student, Term } from '@/lib/types';

export default function StaffPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = staffRosterLabelsFor(school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState<string | null>(null);
  const [cameraForStudent, setCameraForStudent] = useState<string | null>(null);
  const [resultModalStudent, setResultModalStudent] = useState<Student | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Student | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Offline sync status — reflects work saved locally by registerStudent()/saveResult()
  // when the network was unavailable, waiting to be pushed to the server.
  const [pendingStudents, setPendingStudents] = useState(0);
  const [pendingResults, setPendingResults] = useState(0);
  const [stuckStudents, setStuckStudents] = useState(0);
  const [stuckResults, setStuckResults] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  function refreshPendingCounts() {
    setPendingStudents(getPendingStudentsCount());
    setPendingResults(getPendingResultsCount());
    setStuckStudents(getStuckStudentsCount());
    setStuckResults(getStuckResultsCount());
  }

  async function handlePhotoUpload(studentId: string, firstName: string, lastName: string, file: File) {
    setError(null);
    setNotice(null);
    setUploadingPhotoFor(studentId);
    try {
      await uploadStudentPhoto(params.school, studentId, file);
      setNotice(t.photoUpdatedNotice(`${firstName} ${lastName}`));
      loadStudents(selectedClassId);
    } catch (err) {
      setError(t.photoUploadFailed);
    } finally {
      setUploadingPhotoFor(null);
    }
  }

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());

  async function loadClasses() {
    try {
      const [classList, termList] = await Promise.all([listClasses(params.school), listTerms(params.school)]);
      setClasses(classList);
      setTerms(termList);
    } catch (err) {
      setError(t.loadClassesTermsFailed);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStudents(classId: string) {
    try {
      const list = await listStudents(params.school, classId || undefined);
      setStudents(list);
    } catch (err) {
      setError(t.loadStudentsFailed);
    }
  }

  useEffect(() => {
    loadClasses();
    refreshPendingCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStudents(selectedClassId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!selectedClassId) {
      setError(t.chooseClassFirstError);
      return;
    }
    const outcome = await registerStudent(params.school, {
      classId: selectedClassId,
      firstName,
      lastName,
      admissionYear,
    });
    if (outcome.queued) {
      setNotice(t.registeredOfflineNotice);
    } else {
      setNotice(t.registeredNotice(String(outcome.student?.studentId)));
      loadStudents(selectedClassId);
    }
    setFirstName('');
    setLastName('');
    refreshPendingCounts();
  }

  async function handleWithdraw(studentId: string) {
    setError(null);
    setIsWithdrawing(true);
    try {
      await withdrawStudent(params.school, studentId);
      loadStudents(selectedClassId);
      setWithdrawTarget(null);
    } catch (err) {
      setError(t.couldNotRemoveStudent);
      setWithdrawTarget(null);
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleSyncNow() {
    setError(null);
    setNotice(null);
    setIsSyncing(true);
    try {
      const [studentResult, resultResult] = await Promise.all([syncQueuedStudents(), syncQueuedResults()]);
      refreshPendingCounts();
      loadStudents(selectedClassId);
      const failed = studentResult.failed + resultResult.failed;
      if (failed > 0) {
        setNotice(t.syncedSomeNotice(failed));
      } else {
        setNotice(t.allSyncedNotice);
      }
    } catch {
      setError(t.syncFailedError);
    } finally {
      setIsSyncing(false);
    }
  }

  if (isLoading) return <LoadingScreen />;

  const hasPendingSync = pendingStudents > 0 || pendingResults > 0;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — {t.pageTitle}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}

      <section className="card">
        <h2 className="mb-2 font-medium">{t.classesAndStudentsHeading}</h2>
        <select
          className="mb-3 rounded border px-2 py-1"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">{t.allClasses}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ul className="flex flex-col gap-2">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-xl border border-black/5 p-3 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-xs text-ink/30">
                    {s.firstName[0]}
                    {s.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-ink/50">
                    <span className="font-mono">{s.studentId ?? t.pendingId}</span>
                    <span
                      className={`badge ${
                        s.status === 'ACTIVE' ? 'badge-green' : s.status === 'WITHDRAWN' ? 'badge-red' : 'badge-amber'
                      }`}
                    >
                      {s.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-black/5 p-1">
                <button
                  title={t.enterResultsTitle}
                  className="rounded-full p-2 text-ink/60 hover:bg-white hover:text-brand-blue"
                  onClick={() => setResultModalStudent(s)}
                >
                  <FileEdit size={15} />
                </button>
                <label
                  title={t.uploadPhotoTitle}
                  className="cursor-pointer rounded-full p-2 text-ink/60 hover:bg-white hover:text-brand-blue"
                >
                  {uploadingPhotoFor === s.id ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <ImagePlus size={15} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhotoFor === s.id}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handlePhotoUpload(s.id, s.firstName, s.lastName, file);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  title={t.useCameraTitle}
                  className="rounded-full p-2 text-ink/60 hover:bg-white hover:text-brand-blue"
                  onClick={() => setCameraForStudent(s.id)}
                >
                  <Camera size={15} />
                </button>
                {s.status !== 'WITHDRAWN' && (
                  <button
                    title={t.removeFromClassTitle}
                    className="rounded-full p-2 text-ink/60 hover:bg-white hover:text-red-600"
                    onClick={() => setWithdrawTarget(s)}
                  >
                    <UserMinus size={15} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-3 font-medium">{t.bulkImportHeading}</h2>
        <p className="mb-3 text-xs text-ink/50">{t.bulkImportHelp}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            onClick={async () => {
              const blob = await downloadStudentImportTemplate(params.school);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'student-import-template.xlsx';
              a.click();
            }}
            className="btn-secondary"
          >
            {t.downloadTemplateBtn}
          </button>
          <label className="btn-primary cursor-pointer">
            {isImporting ? t.importingBtn : t.uploadFilledTemplateBtn}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={isImporting}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsImporting(true);
                try {
                  const result = await bulkImportStudents(params.school, file);
                  setNotice(
                    result.errors.length > 0
                      ? t.importAddedNotice(
                          result.addedCount,
                          `${result.errors.length} row(s) had issues: ${result.errors
                            .map((er) => `row ${er.row} — ${er.reason}`)
                            .join('; ')}`,
                        )
                      : t.importAddedSimpleNotice(result.addedCount),
                  );
                  loadStudents(selectedClassId);
                } catch {
                  setError(t.importFailed);
                } finally {
                  setIsImporting(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">{t.registerStudentHeading}</h2>
        <form onSubmit={handleRegister} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            {t.firstNameLabel}
            <input className="rounded border px-2 py-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.lastNameLabel}
            <input className="rounded border px-2 py-1" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t.admissionYearLabel}
            <input
              className="rounded border px-2 py-1"
              type="number"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value))}
              required
            />
          </label>
          <button type="submit" className="rounded bg-blue-700 px-3 py-1.5 text-white">
            {t.registerBtn}
          </button>
        </form>
      </section>

      {/*
        Previously this held a second, disconnected "enter results" form —
        resultStudentId was never wired to a setter, so it silently did
        nothing. Real result entry lives in ResultEntryModal, opened via
        the pencil icon above. This panel replaces it with something the
        old form never gave staff: visibility into what's still waiting
        to sync from this device.
      */}
      <section className="card">
        <h2 className="mb-1 font-medium">{t.resultsAndSyncHeading}</h2>
        <p className="mb-3 text-xs text-ink/50">
          <FileEdit size={12} className="inline align-text-bottom" /> {t.useIconToEnterResults}
        </p>
        {hasPendingSync ? (
          <div className="flex flex-col gap-3">
            {(stuckStudents > 0 || stuckResults > 0) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-medium">{t.stuckChangesHeading}</p>
                {stuckStudents > 0 && <p>{t.stuckStudentsMessage(stuckStudents)}</p>}
                {stuckResults > 0 && <p>{t.stuckResultsMessage(stuckResults)}</p>}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="text-sm text-amber-900">
                {pendingStudents > 0 && <p>{t.pendingStudentsMessage(pendingStudents)}</p>}
                {pendingResults > 0 && <p>{t.pendingResultsMessage(pendingResults)}</p>}
              </div>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded bg-blue-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? t.syncingBtn : t.syncNowBtn}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 size={16} />
            {t.everythingSynced}
          </div>
        )}
      </section>

      {cameraForStudent && (
        <CameraCapture
          onCapture={(file) => {
            const s = students.find((x) => x.id === cameraForStudent);
            if (s) handlePhotoUpload(s.id, s.firstName, s.lastName, file);
          }}
          onClose={() => setCameraForStudent(null)}
        />
      )}
      {withdrawTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isWithdrawing && setWithdrawTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-2 text-lg font-semibold">{t.removeStudentTitle}</h2>
            <p className="mb-5 text-sm text-ink/60">
              {t.removeStudentConfirmPrefix}
              <span className="font-medium text-ink">
                {withdrawTarget.firstName} {withdrawTarget.lastName}
              </span>
              {t.removeStudentConfirmSuffix}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setWithdrawTarget(null)}
                disabled={isWithdrawing}
                className="btn-secondary disabled:opacity-50"
              >
                {t.noCancel}
              </button>
              <button
                onClick={() => handleWithdraw(withdrawTarget.id)}
                disabled={isWithdrawing}
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {isWithdrawing ? t.removingBtn : t.yesRemove}
              </button>
            </div>
          </div>
        </div>
      )}
      {resultModalStudent && (
        <ResultEntryModal
          school={params.school}
          studentId={resultModalStudent.id}
          studentName={`${resultModalStudent.firstName} ${resultModalStudent.lastName}`}
          classId={resultModalStudent.classId}
          terms={terms}
          onClose={() => {
            setResultModalStudent(null);
            refreshPendingCounts();
          }}
        />
      )}
    </main>
  );
}
