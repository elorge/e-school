// web/app/[school]/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listClasses } from '@/lib/endpoints/classes';
import { listStudents, registerStudent, withdrawStudent } from '@/lib/endpoints/students';
import { uploadStudentPhoto } from '@/lib/endpoints/uploads';
import { listTerms } from '@/lib/endpoints/terms';
import { getResult, saveResult } from '@/lib/endpoints/results';
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());

  const [resultStudentId, setResultStudentId] = useState('');
  const [resultTermId, setResultTermId] = useState('');
  const [subjectScoresText, setSubjectScoresText] = useState('{\n  "Mathematics": 0,\n  "English": 0\n}');
  const [teacherComment, setTeacherComment] = useState('');

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
        setSubjectScoresText(JSON.stringify(existing.subjectScores, null, 2));
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

    let subjectScores: Record<string, number>;
    try {
      subjectScores = JSON.parse(subjectScoresText);
    } catch {
      setError('Subject scores must be valid JSON, e.g. { "Mathematics": 78 }');
      return;
    }

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
      <section>
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
        <ul className="flex flex-col gap-1">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded border px-3 py-1.5 text-sm">
              <span>
                {s.firstName} {s.lastName} — {s.studentId ?? 'pending ID'} ({s.status})
              </span>
              <div className="flex gap-2">
                <button
                  className="text-blue-700 underline"
                  onClick={() => {
                    setResultStudentId(s.id);
                    if (resultTermId) loadExistingResult(s.id, resultTermId);
                  }}
                >
                  Enter results
                </button>
                <label className="cursor-pointer text-brand-blue underline">
                  Add photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await uploadStudentPhoto(params.school, s.id, file);
                      loadStudents(selectedClassId);
                    }}
                  />
                </label>
                {s.status !== 'WITHDRAWN' && (
                  <button className="text-red-600 underline" onClick={() => handleWithdraw(s.id)}>
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
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

      <section>
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
          <label className="flex flex-col gap-1 text-sm">
            Subject scores (JSON)
            <textarea
              className="min-h-[120px] rounded border px-2 py-1 font-mono text-xs"
              value={subjectScoresText}
              onChange={(e) => setSubjectScoresText(e.target.value)}
            />
          </label>
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
    </main>
  );
}