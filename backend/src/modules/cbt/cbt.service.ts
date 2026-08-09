// backend/src/modules/cbt/cbt.service.ts
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { MathRendererService } from '../../common/services/math-renderer.service';
import { AssessmentScoringService } from '../assessment/assessment-scoring.service';
import { renderTextWithMath } from '../../common/utils/render-math-text';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { ResultsService } from '../results/results.service';
import { SchoolsService } from '../schools/schools.service';
import { CbtAttemptStatus, CbtTestStatus } from '@prisma/client';

const TEMPLATE_HEADERS = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer (A/B/C/D)', 'Points'];

@Injectable()
export class CbtService {
  private readonly logger = new Logger(CbtService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly resultsService: ResultsService,
    private readonly schoolsService: SchoolsService,
    private readonly mathRenderer: MathRendererService,
    private readonly assessmentScoring: AssessmentScoringService,
  ) {}

createTest(
    schoolId: string,
    createdByStaffId: string,
    data: {
      termId: string;
      classId: string;
      subject: string;
      title: string;
      durationMinutes: number;
      theoryMaxScore: number;
      scheduledDate: string;
      accessWindowMinutes?: number;
      countsTowardReport?: boolean;
      componentName?: string;
    },
  ) {
    // Default window = the test's own duration + 30 minutes grace for
    // staggered starts in a lab — long enough for stragglers, short
    // enough that the code is dead well before end of day.
    const accessWindowMinutes = data.accessWindowMinutes ?? data.durationMinutes + 30;
    return this.prisma.cbtTest.create({
      data: {
        schoolId,
        createdByStaffId,
        termId: data.termId,
        classId: data.classId,
        subject: data.subject,
        title: data.title,
        durationMinutes: data.durationMinutes,
        theoryMaxScore: data.theoryMaxScore,
        scheduledDate: new Date(data.scheduledDate),
        accessWindowMinutes,
        countsTowardReport: data.countsTowardReport ?? true,
        componentName: data.componentName ?? 'Test',
        objectiveMaxScore: 0,
      },
    });
  }

  findBySchool(schoolId: string) {
    return this.prisma.cbtTest.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' } });
  }

  /**
   * DRAFT: any of title/subject/durationMinutes/theoryMaxScore/
   * scheduledDate/countsTowardReport/componentName may change freely —
   * nothing has been scored or scheduled to students yet.
   *
   * PUBLISHED/CLOSED: only title and scheduledDate are accepted, even if
   * the caller sends other fields — they're just dropped rather than
   * erroring, so a client built against the DRAFT field set doesn't need
   * special-case error handling, it just silently has less effect.
   * Scoring fields are locked because objectiveMaxScore and any synced
   * ResultEntry rows already depend on them; durationMinutes is locked
   * because in-progress attempts have already computed deadlineAt from it.
   */
  async updateTest(
    schoolId: string,
    testId: string,
    data: {
      title?: string;
      subject?: string;
      durationMinutes?: number;
      theoryMaxScore?: number;
      scheduledDate?: string;
      countsTowardReport?: boolean;
      componentName?: string;
    },
  ) {
    const test = await this.findOneOrThrow(schoolId, testId);

    const patch: Record<string, unknown> = {};
    if (test.status === CbtTestStatus.DRAFT) {
      if (data.title !== undefined) patch.title = data.title;
      if (data.subject !== undefined) patch.subject = data.subject;
      if (data.durationMinutes !== undefined) patch.durationMinutes = data.durationMinutes;
      if (data.theoryMaxScore !== undefined) patch.theoryMaxScore = data.theoryMaxScore;
      if (data.scheduledDate !== undefined) patch.scheduledDate = new Date(data.scheduledDate);
      if (data.countsTowardReport !== undefined) patch.countsTowardReport = data.countsTowardReport;
      if (data.componentName !== undefined) patch.componentName = data.componentName;
    } else {
      // PUBLISHED or CLOSED — cosmetic/reschedule fields only.
      if (data.title !== undefined) patch.title = data.title;
      if (data.scheduledDate !== undefined) patch.scheduledDate = new Date(data.scheduledDate);
    }

    if (Object.keys(patch).length === 0) return test;
    return this.prisma.cbtTest.update({ where: { id: testId }, data: patch });
  }

  async findOneOrThrow(schoolId: string, testId: string) {
    const test = await this.prisma.cbtTest.findFirst({ where: { id: testId, schoolId }, include: { questions: true } });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async addQuestion(schoolId: string, testId: string, data: any) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.DRAFT) {
      throw new BadRequestException('Cannot add questions after a test is published');
    }
    if (data.type === 'OBJECTIVE') {
      if (data.correctOptionIndex < 0 || data.correctOptionIndex >= (data.options?.length ?? 0)) {
        throw new BadRequestException('correctOptionIndex must point at one of the given options');
      }
    }
    const order = test.questions.length;
    return this.prisma.cbtQuestion.create({ data: { testId, order, ...data } });
  }

  /**
   * DRAFT only — see the class comment on updateTest for why. Once
   * PUBLISHED, objectiveMaxScore and any attempts already in progress or
   * graded are keyed off these exact questions; editing correctOptionIndex
   * or points afterward would silently desync scores nobody would notice.
   */
  async updateQuestion(schoolId: string, testId: string, questionId: string, data: any) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.DRAFT) {
      throw new BadRequestException('Cannot edit questions after a test is published');
    }
    const question = test.questions.find((q) => q.id === questionId);
    if (!question) throw new NotFoundException('Question not found on this test');

    const patch: Record<string, unknown> = {};
    if (data.questionText !== undefined) patch.questionText = data.questionText;
    if (data.points !== undefined) patch.points = data.points;

    if (question.type === 'OBJECTIVE') {
      const options = data.options !== undefined ? data.options : (question.options as string[]);
      const correctOptionIndex = data.correctOptionIndex !== undefined ? data.correctOptionIndex : question.correctOptionIndex;
      if (correctOptionIndex == null || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
        throw new BadRequestException('correctOptionIndex must point at one of the given options');
      }
      if (data.options !== undefined) patch.options = data.options;
      if (data.correctOptionIndex !== undefined) patch.correctOptionIndex = data.correctOptionIndex;
    } else {
      if (data.starterHtml !== undefined) patch.starterHtml = data.starterHtml;
      if (data.starterCss !== undefined) patch.starterCss = data.starterCss;
      if (data.starterJs !== undefined) patch.starterJs = data.starterJs;
      if (data.testAssertions !== undefined) patch.testAssertions = data.testAssertions;
    }

    if (Object.keys(patch).length === 0) return question;
    return this.prisma.cbtQuestion.update({ where: { id: questionId }, data: patch });
  }

  /** Same DRAFT-only restriction as updateQuestion, and for the same reason. */
  async deleteQuestion(schoolId: string, testId: string, questionId: string) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.DRAFT) {
      throw new BadRequestException('Cannot remove questions after a test is published');
    }
    const question = test.questions.find((q) => q.id === questionId);
    if (!question) throw new NotFoundException('Question not found on this test');
    await this.prisma.cbtQuestion.delete({ where: { id: questionId } });
    return { deleted: true };
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
          type: 'OBJECTIVE',
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

const accessCode = String(randomInt(0, 1_000_000)).padStart(6, '0');

    try {
      await this.prisma.$transaction([
        this.prisma.cbtTest.update({
          where: { id: testId },
          data: { status: CbtTestStatus.PUBLISHED, objectiveMaxScore, accessCode },
        }),
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

async startAttemptByAccessCode(schoolId: string, accessCode: string, admissionId: string) {
    const test = await this.prisma.cbtTest.findFirst({ where: { schoolId, accessCode, status: CbtTestStatus.PUBLISHED } });
    if (!test) throw new NotFoundException('Invalid or expired access code');

    this.assertWithinScheduledWindow(test);

    const student = await this.prisma.student.findFirst({ where: { schoolId, studentId: admissionId } });
    if (!student) throw new NotFoundException('Admission ID not recognized');

    return this.getAttemptForStudent(schoolId, test.id, student.id);
  }

 /**
   * Nigeria is UTC+1 with no DST — a fixed offset, not a named timezone
   * lookup, so this needs no timezone library. Deliberately does NOT
   * rely on the server's local TZ setting — this converts explicitly,
   * so behavior is identical whether TZ is configured on the host or not.
   */
  private static readonly WAT_OFFSET_MS = 60 * 60 * 1000; // UTC+1

  private toWatCalendarDay(date: Date): string {
    const watTime = new Date(date.getTime() + CbtService.WAT_OFFSET_MS);
    return watTime.toISOString().slice(0, 10); // "YYYY-MM-DD" in WAT terms
  }

  /**
   * Valid for the ENTIRE scheduled calendar day (WAT) — 00:00 to 23:59,
   * not a short time-slice within it. A code generated for "15th July"
   * works any time on the 15th, and stops working entirely once the
   * 16th begins. accessWindowMinutes is no longer used for the time-of-
   * day cutoff (that was the bug — it anchored the window to midnight,
   * so it expired hours before school even opened); the field stays in
   * the schema for a future "specific start time" feature if you want
   * one, but plays no part in this check today.
   */
  private assertWithinScheduledWindow(test: { scheduledDate: Date }) {
    const now = new Date();
    const todayWat = this.toWatCalendarDay(now);
    const scheduledWat = this.toWatCalendarDay(test.scheduledDate);

    if (todayWat !== scheduledWat) {
      throw new ForbiddenException(`This test is scheduled for ${scheduledWat} (WAT) — the access code only works on that day.`);
    }
  }

async getAttemptForStudent(schoolId: string, testId: string, studentId: string) {
    const test = await this.findOneOrThrow(schoolId, testId);
    if (test.status !== CbtTestStatus.PUBLISHED) throw new ForbiddenException('This test is not currently open');
    this.assertWithinScheduledWindow(test);

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
      .map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        points: q.points,
        starterHtml: q.starterHtml,
        starterCss: q.starterCss,
        starterJs: q.starterJs,
        testAssertions: q.testAssertions, // assertions themselves ARE sent — they run client-side, not a secret to protect
      }));

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
      const submitted = answers[q.id];
      if (q.type === 'OBJECTIVE') {
        return submitted === q.correctOptionIndex ? sum + q.points : sum;
      }
      // CODE — the client already computed a per-question pass ratio
      // when the student ran their tests (see CodeQuestionRunner);
      // that's stored as { passedCount, totalCount } in answers[q.id].
      // Treated as provisional: visible in full to the teacher via
      // AttemptDetailModal for manual confirmation, same pattern as
      // theory scoring below.
      const codeResult = submitted as { passedCount?: number; totalCount?: number } | undefined;
      if (codeResult?.totalCount) {
        return sum + Math.round((codeResult.passedCount! / codeResult.totalCount) * q.points);
      }
      return sum;
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
    if (!test.countsTowardReport) return null; // practice/mock — never touches the official result

    const combinedRaw = (attempt.objectiveScore ?? 0) + (attempt.theoryScore ?? 0);
    const maxPossible = test.objectiveMaxScore + test.theoryMaxScore;
    const normalizedTo100 = maxPossible > 0 ? Math.round((combinedRaw / maxPossible) * 100) : 0;

    await this.assessmentScoring.recordComponentScore(schoolId, studentId, test.termId, test.subject, test.componentName, normalizedTo100, 'CBT');
    const recomputed = await this.assessmentScoring.recomputeAndSync(schoolId, studentId, test.termId, test.subject);
    if (recomputed !== null) return recomputed; // weighted config handled the ResultEntry write

    // Legacy path — no weight config for this class/subject, exact pre-existing behavior.
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

  /**
   * Fetches a logo (or any other referenced image) from its stored URL
   * for embedding into a generated PDF. Best-effort: a missing or
   * unreachable image should never block the test paper itself from
   * generating — the caller wraps the pdfkit `.image()` call in its own
   * try/catch for the "downloaded but not a valid image" case, and this
   * method covers the "couldn't even download it" case by returning null
   * instead of throwing.
   */
  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`Could not fetch image at ${url}: HTTP ${response.status}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      this.logger.warn(`Could not fetch image at ${url}: ${err}`);
      return null;
    }
  }

  /**
   * A printable version of the test — questions, options, and (blank)
   * answer space, with any $...$ LaTeX segments rendered as real
   * equations instead of raw text. Useful as a physical backup, or for
   * the theory portion of a mixed test which is answered on paper by
   * design (see PinsService/ResultsService — theory scores are always
   * hand-entered, never auto-graded).
   *
   * CODE questions have no printable equivalent (there's no paper
   * substitute for a live sandboxed editor), so they're listed with
   * just their instructions and a note, rather than attempting to
   * render starter code/assertions as if they were fill-in-the-blank
   * text.
   */
  async renderTestPaperPdf(schoolId: string, testId: string): Promise<Buffer> {
    const test = await this.findOneOrThrow(schoolId, testId);
    const [school, klass] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.class.findUniqueOrThrow({ where: { id: test.classId } }),
    ]);
    const logoBuffer = school.logoUrl ? await this.fetchImageBuffer(school.logoUrl) : null;

    // Matches the on-screen palette (#137CBD / #2D3B45 / #6B7780 / #C7CDD1 /
    // #F5F5F5) so the printed paper and the quiz-taking screen read as the
    // same product rather than two different tools.
    const INK = '#2D3B45';
    const MUTED = '#6B7780';
    const BORDER = '#C7CDD1';
    const HEADER_FILL = '#F5F5F5';
    const HEADER_BAR_HEIGHT = 22;
    const CARD_PADDING = 10;
    const CARD_GAP = 14;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, doc.page.margins.left, doc.page.margins.top, { width: 40, height: 40, fit: [40, 40] });
        } catch (err) {
          this.logger.warn(`Test paper logo for school ${schoolId} was not a valid image: ${err}`);
        }
      }
      doc.fillColor(INK).fontSize(16).font('Helvetica-Bold').text(school.name, { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`${test.title} — ${test.subject}`, { align: 'center' });
      doc.fontSize(9).fillColor(MUTED).text(`Class: ${klass.name}   •   Duration: ${test.durationMinutes} minutes`, { align: 'center' });
      doc.fillColor(INK);
      doc.moveDown(1.5);

      const sortedQuestions = [...test.questions].sort((a, b) => a.order - b.order);

      for (let i = 0; i < sortedQuestions.length; i++) {
        const q = sortedQuestions[i];

        // Reserve enough room for at least the header bar + a couple lines
        // before starting a new card — a card is never allowed to open on
        // one page and immediately continue on the next.
        if (doc.y > doc.page.height - doc.page.margins.bottom - 130) {
          doc.addPage();
        }

        const cardStartY = doc.y;
        const headerY = cardStartY;

        // Header bar: light fill, "Question N" left / "X pts" right,
        // vertically centered within HEADER_BAR_HEIGHT.
        doc.rect(doc.page.margins.left, headerY, contentWidth, HEADER_BAR_HEIGHT).fill(HEADER_FILL);

        const pointsLabel = `${q.points} pt${q.points !== 1 ? 's' : ''}`;
        doc
          .fillColor(INK)
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .text(`Question ${i + 1}`, doc.page.margins.left + CARD_PADDING, headerY + 6, {
            width: contentWidth - CARD_PADDING * 2 - 60,
            lineBreak: false,
          });
        doc
          .fillColor(MUTED)
          .font('Helvetica')
          .fontSize(9.5)
          .text(pointsLabel, doc.page.margins.left, headerY + 6, {
            width: contentWidth - CARD_PADDING,
            align: 'right',
            lineBreak: false,
          });
        doc.fillColor(INK);

        let y = headerY + HEADER_BAR_HEIGHT + CARD_PADDING;
        const bodyLeft = doc.page.margins.left + CARD_PADDING;
        const bodyWidth = contentWidth - CARD_PADDING * 2;

        if (q.type !== 'OBJECTIVE') {
          y = renderTextWithMath(doc, this.mathRenderer, q.questionText, bodyLeft, y, bodyWidth, 11);
          doc.y = y;
          doc
            .fontSize(8.5)
            .fillColor(MUTED)
            .text('Code challenge — completed on-screen, no written answer space.', bodyLeft, doc.y + 4, { width: bodyWidth });
          doc.fillColor(INK);
          y = doc.y;
        } else {
          y = renderTextWithMath(doc, this.mathRenderer, q.questionText, bodyLeft, y, bodyWidth, 11);
          doc.y = y;
          doc.moveDown(0.2);
          y = doc.y;

          const options = q.options as string[];
          const letters = ['A', 'B', 'C', 'D'];
          for (let j = 0; j < options.length; j++) {
            const newY = renderTextWithMath(doc, this.mathRenderer, `${letters[j]}) ${options[j]}`, bodyLeft + 10, y, bodyWidth - 10, 10);
            y = newY;
          }
          doc.y = y;
        }

        const cardEndY = doc.y + CARD_PADDING;

        // Card border, drawn after the content so its true height is known —
        // a thin stroke around the whole header+body, matching the on-screen
        // card's border color.
        doc.rect(doc.page.margins.left, cardStartY, contentWidth, cardEndY - cardStartY).lineWidth(0.75).strokeColor(BORDER).stroke();

        doc.y = cardEndY + CARD_GAP;
      }

      doc.end();
    });
  }

  async getAttemptDetail(schoolId: string, testId: string, attemptId: string) {
    const attempt = await this.prisma.cbtAttempt.findFirst({
      where: { id: attemptId, test: { id: testId, schoolId } },
      include: {
        student: { select: { firstName: true, lastName: true, studentId: true } },
        test: { include: { questions: true } },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const answers = attempt.answers as Record<string, any>;
    const questions = [...attempt.test.questions]
      .sort((a, b) => a.order - b.order)
      .map((q) => {
        const submitted = answers[q.id];

        if (q.type === 'OBJECTIVE') {
          return {
            id: q.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options as string[],
            correctOptionIndex: q.correctOptionIndex,
            selectedOptionIndex: typeof submitted === 'number' ? submitted : null,
            isCorrect: submitted === q.correctOptionIndex,
            points: q.points,
          };
        }

        // CODE — submitted is exactly what CodeQuestionRunner's onResult
        // produces: { passedCount, totalCount, html, css, js, results }.
        // Kept field-for-field identical to that shape rather than
        // introducing a combined "code" string, so this stays a single
        // source of truth instead of two representations drifting apart.
        const codeResult = submitted as
          | {
              html?: string;
              css?: string;
              js?: string;
              passedCount?: number;
              totalCount?: number;
              results?: { description: string; passed: boolean }[];
            }
          | undefined;

        return {
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          starterHtml: q.starterHtml,
          starterCss: q.starterCss,
          starterJs: q.starterJs,
          testAssertions: q.testAssertions,
          submittedHtml: codeResult?.html ?? null,
          submittedCss: codeResult?.css ?? null,
          submittedJs: codeResult?.js ?? null,
          passedCount: codeResult?.passedCount ?? 0,
          totalCount: codeResult?.totalCount ?? 0,
          assertionResults: codeResult?.results ?? null,
          points: q.points,
        };
      });

    return {
      student: attempt.student,
      objectiveScore: attempt.objectiveScore,
      theoryScore: attempt.theoryScore,
      status: attempt.status,
      questions,
    };
  }

  async exportAttemptsXlsx(schoolId: string, testId: string): Promise<Buffer> {
    const test = await this.findOneOrThrow(schoolId, testId);
    const attempts = await this.prisma.cbtAttempt.findMany({
      where: { testId },
      include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
      orderBy: { student: { lastName: 'asc' } },
    });
    const sortedQuestions = [...test.questions].sort((a, b) => a.order - b.order);
    const letters = ['A', 'B', 'C', 'D'];

    const rows = attempts.map((a) => {
      const answers = a.answers as Record<string, any>;
      const row: Record<string, string | number> = {
        Student: `${a.student.firstName} ${a.student.lastName}`,
        'Admission ID': a.student.studentId ?? '—',
        Status: a.status,
        'Objective Score': a.objectiveScore ?? '',
        'Theory Score': a.theoryScore ?? '',
      };
      sortedQuestions.forEach((q, i) => {
        const submitted = answers[q.id];
        if (q.type === 'OBJECTIVE') {
          row[`Q${i + 1} Answer`] = typeof submitted === 'number' ? letters[submitted] : '—';
          row[`Q${i + 1} Correct?`] = submitted === q.correctOptionIndex ? 'Yes' : 'No';
        } else {
          const codeResult = submitted as { passedCount?: number; totalCount?: number } | undefined;
          row[`Q${i + 1} Answer`] = codeResult?.totalCount ? `${codeResult.passedCount ?? 0}/${codeResult.totalCount} tests passed` : '—';
          row[`Q${i + 1} Correct?`] = codeResult?.totalCount && codeResult.passedCount === codeResult.totalCount ? 'Yes' : 'No';
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attempts');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}