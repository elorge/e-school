// backend/src/modules/cbt/cbt.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { ResultsService } from '../results/results.service';
import { SchoolsService } from '../schools/schools.service';
import { CbtAttemptStatus, CbtTestStatus } from '@prisma/client';

const TEMPLATE_HEADERS = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer (A/B/C/D)', 'Points'];

@Injectable()
export class CbtService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly resultsService: ResultsService,
    private readonly schoolsService: SchoolsService,
  ) {}

  createTest(
    schoolId: string,
    createdByStaffId: string,
    data: { termId: string; classId: string; subject: string; title: string; durationMinutes: number; theoryMaxScore: number },
  ) {
    return this.prisma.cbtTest.create({
      data: { schoolId, createdByStaffId, ...data, objectiveMaxScore: 0 },
    });
  }

  findBySchool(schoolId: string) {
    return this.prisma.cbtTest.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' } });
  }

  async findOneOrThrow(schoolId: string, testId: string) {
    const test = await this.prisma.cbtTest.findFirst({ where: { id: testId, schoolId }, include: { questions: true } });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async addQuestion(
    schoolId: string,
    testId: string,
    data: { questionText: string; options: string[]; correctOptionIndex: number; points: number },
  ) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.DRAFT) {
      throw new BadRequestException('Cannot add questions after a test is published');
    }
    if (data.correctOptionIndex < 0 || data.correctOptionIndex >= data.options.length) {
      throw new BadRequestException('correctOptionIndex must point at one of the given options');
    }
    const order = test.questions.length;
    return this.prisma.cbtQuestion.create({ data: { testId, order, ...data } });
  }

  /** Generates a blank fill-in template — same column order the parser below expects. */
  generateQuestionTemplate(testTitle: string): Buffer {
    const worksheet = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ['What is the capital of Nigeria?', 'Lagos', 'Abuja', 'Kano', 'Ibadan', 'B', 1],
    ]);
    worksheet['!cols'] = [{ wch: 40 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 8 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, testTitle.slice(0, 28) || 'Questions');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Parses an uploaded template and adds every valid row as a question.
   * Deliberately best-effort per row: one malformed row (missing answer,
   * answer letter not among the given options) doesn't block the rest —
   * it's reported back so the teacher can fix just that row and re-upload
   * only the fix, rather than losing everything on one typo.
   */
  async bulkUploadQuestions(schoolId: string, testId: string, fileBuffer: Buffer) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.DRAFT) {
      throw new BadRequestException('Cannot add questions after a test is published');
    }

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });

// Rows that are entirely blank (common after a Google Sheets export,
    // or a merged-cell artifact) shouldn't even count as errors — only
    // report a row if it has SOME content but is malformed.
    const dataRows = rows
      .slice(1)
      .map((row, i) => ({ row, rowNumber: i + 2 }))
      .filter(({ row }) => row.some((cell) => cell !== undefined && String(cell).trim() !== ''));

    const added: string[] = [];
    const errors: { row: number; reason: string }[] = [];
    let order = test.questions.length;

    const clean = (v: unknown) => (v === undefined || v === null ? '' : String(v).trim());
    // Accepts "A", "a", "A)", "A.", "Answer A" — strips everything but the first letter.
    const extractLetter = (v: unknown) => {
      const match = clean(v).toUpperCase().match(/[A-D]/);
      return match ? match[0] : null;
    };

    for (const { row, rowNumber } of dataRows) {
      const questionText = clean(row[0]);
      const options = [clean(row[1]), clean(row[2]), clean(row[3]), clean(row[4])].filter((o) => o !== '');
      const correctLetter = extractLetter(row[5]);
      const pointsRaw = clean(row[6]);

      if (!questionText) {
        errors.push({ row: rowNumber, reason: 'Missing question text' });
        continue;
      }
      if (options.length < 2) {
        errors.push({ row: rowNumber, reason: 'Needs at least 2 options' });
        continue;
      }
      if (!correctLetter) {
        errors.push({ row: rowNumber, reason: 'Correct Answer column is missing or unreadable — use A, B, C, or D' });
        continue;
      }
      const letterIndex = { A: 0, B: 1, C: 2, D: 3 }[correctLetter]!;
      if (letterIndex >= options.length) {
        errors.push({ row: rowNumber, reason: `Correct Answer "${correctLetter}" has no matching option in this row` });
        continue;
      }

      const points = Number(pointsRaw);
      await this.prisma.cbtQuestion.create({
        data: {
          testId,
          order: order++,
          questionText,
          options,
          correctOptionIndex: letterIndex,
          points: Number.isFinite(points) && points > 0 ? points : 1,
        },
      });
      added.push(questionText);
    }

    return { addedCount: added.length, errors };
  }

/**
   * studentIds, if given, restricts BOTH the assignment and the wallet
   * debit to exactly those students — e.g. only students an admin has
   * separately confirmed as fee-paid. Omit it to assign the whole class
   * (previous default behavior, unchanged for schools that don't need
   * selective assignment).
   */
  async publishTest(schoolId: string, testId: string, idempotencyKey: string, studentIds?: string[]) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.DRAFT) throw new BadRequestException('Test has already been published');
    if (test.questions.length === 0) throw new BadRequestException('Add at least one question before publishing');

    const allActiveInClass = await this.prisma.student.findMany({ where: { classId: test.classId, status: 'ACTIVE' } });
    let students = allActiveInClass;

    if (studentIds && studentIds.length > 0) {
      const allowedIds = new Set(allActiveInClass.map((s) => s.id));
      const invalid = studentIds.filter((id) => !allowedIds.has(id));
      if (invalid.length > 0) {
        throw new BadRequestException('Some selected students are not active members of this test\'s class');
      }
      students = allActiveInClass.filter((s) => studentIds.includes(s.id));
    }

if (students.length === 0) throw new BadRequestException('No students selected to assign the test to');

    // Same per-student-per-term charge PIN generation uses — a student
    // already charged for this term (via PIN generation) is NOT charged
    // again here. CBT and PIN access are billed as one product.
    const pricePerStudentKobo = await this.schoolsService.getEffectivePricePerStudentKobo(schoolId);
    let newlyCharged = 0;
    for (const student of students) {
      const { alreadyCharged } = await this.walletService.debitPlatformAccessFee(schoolId, student.id, test.termId, pricePerStudentKobo);
      if (!alreadyCharged) newlyCharged++;
    }

    const objectiveMaxScore = test.questions.reduce((sum, q) => sum + q.points, 0);

    try {
      await this.prisma.$transaction([
        this.prisma.cbtTest.update({ where: { id: testId }, data: { status: CbtTestStatus.PUBLISHED, objectiveMaxScore } }),
        this.prisma.cbtAttempt.createMany({
          data: students.map((s) => ({ testId, studentId: s.id })),
          skipDuplicates: true,
        }),
      ]);
    } catch (err) {
      for (const student of students) {
        await this.walletService.refund(schoolId, pricePerStudentKobo, `refund-cbt-${testId}-${student.id}`);
      }
      throw err;
    }

    return this.findOneOrThrow(schoolId, testId);
  }

 /**
   * Invigilating staff starts a session for a student physically in
   * front of the device. beginAt is set ONLY on the first call — calling
   * this again (e.g. the device was closed and reopened, or the same
   * attempt is resumed after an offline gap) must never push the
   * deadline forward, or a student could "restart the clock" by closing
   * the tab.
   */
  async getAttemptForStudent(schoolId: string, testId: string, studentId: string) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.PUBLISHED) throw new ForbiddenException('This test is not currently open');

    let attempt = await this.prisma.cbtAttempt.findUnique({ where: { testId_studentId: { testId, studentId } } });
    if (!attempt) throw new NotFoundException('This student is not assigned to this test');
    if (attempt.status !== CbtAttemptStatus.IN_PROGRESS) throw new ForbiddenException('This attempt has already been submitted');

    if (!attempt.beginAt) {
      attempt = await this.prisma.cbtAttempt.update({ where: { id: attempt.id }, data: { beginAt: new Date() } });
    }

    const deadlineAt = new Date(attempt.beginAt!.getTime() + test.durationMinutes * 60 * 1000);

    // Never send correctOptionIndex to the client during the test itself.
    const questions = test.questions
      .sort((a, b) => a.order - b.order)
      .map((q) => ({ id: q.id, questionText: q.questionText, options: q.options, points: q.points }));

    return { attemptId: attempt.id, deadlineAt: deadlineAt.toISOString(), questions, savedAnswers: attempt.answers };
  }

  async saveAnswer(attemptId: string, questionId: string, selectedOptionIndex: number) {
    const attempt = await this.prisma.cbtAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    if (attempt.status !== CbtAttemptStatus.IN_PROGRESS) throw new ForbiddenException('This attempt is no longer in progress');

    const answers = { ...(attempt.answers as Record<string, number>), [questionId]: selectedOptionIndex };
    return this.prisma.cbtAttempt.update({ where: { id: attemptId }, data: { answers } });
  }

/**
   * Idempotent on purpose: if a device submits twice (e.g. it went
   * offline right after a successful submit and the frontend queued a
   * retry), the second call must succeed quietly rather than error —
   * see the offline sync flow in web/lib/cbt-offline.ts.
   */
  async submitAttempt(attemptId: string) {
    const attempt = await this.prisma.cbtAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: { test: { include: { questions: true } } },
    });
    if (attempt.status !== CbtAttemptStatus.IN_PROGRESS) {
      return attempt; // already submitted/graded — treat as success, not an error
    }
    const answers = attempt.answers as Record<string, number>;
    const objectiveScore = attempt.test.questions.reduce((sum, q) => {
      const selected = answers[q.id];
      return selected === q.correctOptionIndex ? sum + q.points : sum;
    }, 0);

    const status = attempt.test.theoryMaxScore > 0 ? CbtAttemptStatus.SUBMITTED : CbtAttemptStatus.GRADED;

    const updated = await this.prisma.cbtAttempt.update({
      where: { id: attemptId },
      data: { objectiveScore, submittedAt: new Date(), status },
    });

    // Objectives-only test: nothing more to wait for, sync the score into the result immediately.
    if (status === CbtAttemptStatus.GRADED) {
      await this.syncScoreToResult(attempt.test.schoolId, attempt.testId, attempt.studentId);
    }

    return updated;
  }

  /** Teacher enters the theory score for a submitted attempt; this completes grading and syncs the combined score into the result. */
  async gradeTheory(schoolId: string, attemptId: string, theoryScore: number, classTeacherId: string) {
    const attempt = await this.prisma.cbtAttempt.findUniqueOrThrow({
      where: { id: attemptId },
      include: { test: true },
    });
    if (attempt.test.schoolId !== schoolId) throw new NotFoundException('Attempt not found');
    if (theoryScore > attempt.test.theoryMaxScore) {
      throw new BadRequestException(`Theory score cannot exceed ${attempt.test.theoryMaxScore}`);
    }
    if (attempt.status === CbtAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Student has not submitted this attempt yet');
    }

    await this.prisma.cbtAttempt.update({
      where: { id: attemptId },
      data: { theoryScore, status: CbtAttemptStatus.GRADED, gradedAt: new Date() },
    });

    return this.syncScoreToResult(schoolId, attempt.testId, attempt.studentId, classTeacherId);
  }

  /**
   * Writes the combined objective+theory score into ResultEntry under
   * the test's subject key — reusing the SAME upsert every manual result
   * entry uses, so a CBT score and a hand-entered score behave
   * identically to everything downstream (report cards, Session Wrap,
   * PIN-gated parent access). No new access mechanism.
   */
  private async syncScoreToResult(schoolId: string, testId: string, studentId: string, classTeacherId?: string) {
    const [test, attempt] = await Promise.all([
      this.prisma.cbtTest.findUniqueOrThrow({ where: { id: testId } }),
      this.prisma.cbtAttempt.findUniqueOrThrow({ where: { testId_studentId: { testId, studentId } } }),
    ]);

    const combinedRaw = (attempt.objectiveScore ?? 0) + (attempt.theoryScore ?? 0);
    const maxPossible = test.objectiveMaxScore + test.theoryMaxScore;
    const normalizedTo100 = maxPossible > 0 ? Math.round((combinedRaw / maxPossible) * 100) : 0;

    const existing = await this.resultsService.findForStudentTerm(schoolId, studentId, test.termId);
    const subjectScores = { ...((existing?.subjectScores as Record<string, number>) ?? {}), [test.subject]: normalizedTo100 };

    return this.resultsService.upsertResult(
      schoolId,
      studentId,
      test.termId,
      subjectScores,
      existing?.teacherComment ?? null,
      classTeacherId ?? existing?.classTeacherId ?? test.createdByStaffId,
    );
  }

  /** Teacher's "view all scores" — every attempt for a test, graded or not. */
  listAttempts(schoolId: string, testId: string) {
    return this.prisma.cbtAttempt.findMany({
      where: { test: { schoolId, id: testId } },
      include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
      orderBy: { student: { lastName: 'asc' } },
    });
  }
}