// web/app/[school]/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents, registerStudent, withdrawStudent } from '@/lib/endpoints/students';
import { uploadStudentPhoto } from '@/lib/endpoints/uploads';
import { listTerms } from '@/lib/endpoints/terms';
import { getResult, saveResult } from '@/lib/endpoints/results';
import CameraCapture from '@/components/CameraCapture';
import ResultEntryModal from '@/components/ResultEntryModal';
import { FileEdit, ImagePlus, Camera, UserMinus, Plus, Trash2 } from 'lucide-react';
import { getSessionUser } from '@/lib/session';
import LoadingScreen from '@/components/LoadingScreen';
import { ApiError } from '@/lib/api';
import type { Class, Student, Term } from '@/lib/types';

export default function StaffPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState<string | null>(null);
  const [cameraForStudent, setCameraForStudent] = useState<string | null>(null);
  const [resultModalStudent, setResultModalStudent] = useState<Student | null>(null);
  async function handlePhotoUpload(studentId: string, firstName: string, lastName: string, file: File) {
    setError(null);
    setNotice(null);
    setUploadingPhotoFor(studentId);
    try {
      await uploadStudentPhoto(params.school, studentId, file);
      setNotice(`Photo updated for ${firstName} ${lastName}.`);
      loadStudents(selectedClassId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingPhotoFor(null);
    }
  }
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());

  const [resultStudentId, setResultStudentId] = useState('');
  const [resultTermId, setResultTermId] = useState('');
  const [scoreRows, setScoreRows] = useState<{ subject: string; score: number }[]>([
    { subject: 'Mathematics', score: 0 },
    { subject: 'English', score: 0 },
  ]);
  const [teacherComment, setTeacherComment] = useState('');

  const COMMON_SUBJECTS = [
    'Mathematics', 'English Language', 'Basic Science', 'Basic Technology', 'Physics', 'Chemistry', 'Biology',
    'Agricultural Science', 'Economics', 'Government', 'Commerce', 'Accounting', 'Literature in English',
    'History', 'Geography', 'Christian Religious Studies', 'Islamic Religious Studies', 'Civic Education',
    'Computer Studies', 'French',
  ];

  function updateRow(index: number, field: 'subject' | 'score', value: string) {
    setScoreRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: field === 'score' ? Number(value) : value } : r)));
  }

  function addRow() {
    setScoreRows((rows) => [...rows, { subject: '', score: 0 }]);
  }

  function removeRow(index: number) {
    setScoreRows((rows) => rows.filter((_, i) => i !== index));
  }

async function loadClasses() {
    try {
      const [classList, termList] = await Promise.all([listClasses(params.school), listTerms(params.school)]);
      setClasses(classList);
      setTerms(termList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load classes/terms');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStudents(classId: string) {
    try {
      const list = await listStudents(params.school, classId || undefined);
      setStudents(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load students');
    }
  }

  useEffect(() => {
    loadClasses();
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
      setError('Choose a class first');
      return;
    }
    const outcome = await registerStudent(params.school, {
      classId: selectedClassId,
      firstName,
      lastName,
      admissionYear,
    });
    if (outcome.queued) {
      setNotice('No internet right now — student saved on this device and will sync automatically.');
    } else {
      setNotice(`Registered — Admission ID: ${outcome.student?.studentId}`);
      loadStudents(selectedClassId);
    }
    setFirstName('');
    setLastName('');
  }

  async function handleWithdraw(studentId: string) {
    setError(null);
    try {
      await withdrawStudent(params.school, studentId);
      loadStudents(selectedClassId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove student');
    }
  }

  async function loadExistingResult(studentId: string, termId: string) {
    if (!studentId || !termId) return;
    try {
      const existing = await getResult(params.school, studentId, termId);
      if (existing) {
        const rows = Object.entries(existing.subjectScores).map(([subject, score]) => ({ subject, score: score as number }));
        setScoreRows(rows.length > 0 ? rows : [{ subject: '', score: 0 }]);
        setTeacherComment(existing.teacherComment ?? '');
      }
    } catch {
      // No existing result yet — leave the form as-is.
    }
  }

  async function handleSaveResult(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const user = getSessionUser();
    if (!user) {
      setError('Session expired — please log in again.');
      return;
    }

    const validRows = scoreRows.filter((r) => r.subject.trim() !== '');
    if (validRows.length === 0) {
      setError('Add at least one subject.');
      return;
    }
    if (validRows.some((r) => r.score < 0 || r.score > 100)) {
      setError('Scores must be between 0 and 100.');
      return;
    }
    const subjectScores: Record<string, number> = {};
    for (const row of validRows) subjectScores[row.subject.trim()] = row.score;

    const outcome = await saveResult(params.school, resultStudentId, resultTermId, {
      subjectScores,
      teacherComment: teacherComment || undefined,
      classTeacherId: user.id,
    });
    setNotice(
      outcome.queued
        ? 'No internet right now — result saved on this device and will sync automatically.'
        : 'Result saved.',
    );
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{school.name} — Staff</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-green-700">{notice}</p>}
      <section className="card">
        <h2 className="mb-2 font-medium">Classes &amp; Students</h2>
        <select
          className="mb-3 rounded border px-2 py-1"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ul className="flex flex-col gap-2">
          {students.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-xl border border-black/5 p-3 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
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
                    <span className="font-mono">{s.studentId ?? 'pending ID'}</span>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-green' : s.status === 'WITHDRAWN' ? 'badge-red' : 'badge-amber'}`}>
                      {s.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-black/5 p-1">
                <button
                  title="Enter results"
                  className="rounded-full p-2 text-ink/60 hover:bg-white hover:text-brand-blue"
                  onClick={() => setResultModalStudent(s)}
                >
                  <FileEdit size={15} />
                </button>
                <label title="Upload photo" className="cursor-pointer rounded-full p-2 text-ink/60 hover:bg-white hover:text-brand-blue">
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
                  title="Use camera"
                  className="rounded-full p-2 text-ink/60 hover:bg-white hover:text-brand-blue"
                  onClick={() => setCameraForStudent(s.id)}
                >
                  <Camera size={15} />
                </button>
                {s.status !== 'WITHDRAWN' && (
                  <button title="Remove from class" className="rounded-full p-2 text-ink/60 hover:bg-white hover:text-red-600" onClick={() => handleWithdraw(s.id)}>
                    <UserMinus size={15} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Register a student</h2>
        <form onSubmit={handleRegister} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            First name
            <input className="rounded border px-2 py-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Last name
            <input className="rounded border px-2 py-1" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Admission year
            <input
              className="rounded border px-2 py-1"
              type="number"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value))}
              required
            />
          </label>
          <button type="submit" className="rounded bg-blue-700 px-3 py-1.5 text-white">
            Register
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-2 font-medium">Enter results</h2>
        <form onSubmit={handleSaveResult} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Term
            <select
              className="rounded border px-2 py-1"
              value={resultTermId}
              onChange={(e) => {
                setResultTermId(e.target.value);
                if (resultStudentId) loadExistingResult(resultStudentId, e.target.value);
              }}
              required
            >
              <option value="">Select a term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-gray-500">
            Student:{' '}
            {students.find((s) => s.id === resultStudentId)?.firstName ??
              '— pick "Enter results" on a student above'}
          </p>
          <div>
            <p className="mb-2 text-sm font-medium">Subject scores</p>
            <datalist id="subject-suggestions">
              {COMMON_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <div className="flex flex-col gap-2">
              {scoreRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded border px-2 py-1.5 text-sm"
                    list="subject-suggestions"
                    placeholder="Subject"
                    value={row.subject}
                    onChange={(e) => updateRow(i, 'subject', e.target.value)}
                  />
                  <input
                    className="w-20 rounded border px-2 py-1.5 text-center text-sm"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Score"
                    value={row.score}
                    onChange={(e) => updateRow(i, 'score', e.target.value)}
                  />
                  <span className="w-8 shrink-0 text-xs text-ink/40">/ 100</span>
                  <button type="button" onClick={() => removeRow(i)} className="text-ink/30 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="btn-secondary mt-2 flex items-center gap-1.5 text-xs">
              <Plus size={13} /> Add subject
            </button>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Teacher's comment
            <textarea
              className="rounded border px-2 py-1"
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={!resultStudentId || !resultTermId}
            className="w-fit rounded bg-blue-700 px-3 py-1.5 text-white disabled:opacity-50"
          >
            Save result
          </button>
        </form>
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
      {resultModalStudent && (
        <ResultEntryModal
          school={params.school}
          studentId={resultModalStudent.id}
          studentName={`${resultModalStudent.firstName} ${resultModalStudent.lastName}`}
          classId={resultModalStudent.classId}
          terms={terms}
          onClose={() => setResultModalStudent(null)}
        />
      )}
    </main>
  );
}