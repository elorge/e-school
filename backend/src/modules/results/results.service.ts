// backend/src/modules/results/results.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  findForStudentTerm(schoolId: string, studentId: string, termId: string) {
    return this.prisma.resultEntry.findFirst({ where: { schoolId, studentId, termId } });
  }

  // Ownership rule (spec doc §5) is enforced in the controller.
  // FIX: was a bare .create() despite the method name promising upsert
  // behavior — a second submission for the same student+term would throw
  // once the (schoolId, studentId, termId) unique constraint landed on
  // ResultEntry. Now genuinely idempotent: a re-submission (e.g. a
  // teacher correcting a typo'd score) updates the existing row instead
  // of erroring.
  upsertResult(
    schoolId: string,
    studentId: string,
    termId: string,
    subjectScores: Record<string, number>,
    teacherComment: string | null,
    classTeacherId: string,
  ) {
    return this.prisma.resultEntry.upsert({
      where: { schoolId_studentId_termId: { schoolId, studentId, termId } },
      create: { schoolId, studentId, termId, subjectScores, teacherComment, classTeacherId },
      update: { subjectScores, teacherComment, classTeacherId },
    });
  }

  findTrend(schoolId: string, studentId: string) {
    // Ordered history for the report's performance-trend rendering — see
    // spec doc §10.2. Computed at render time, never stored.
    return this.prisma.resultEntry.findMany({
      where: { schoolId, studentId },
      orderBy: { createdAt: 'asc' },
    });
  }
}