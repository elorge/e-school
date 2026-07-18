// backend/src/modules/assessment/assessment-scoring.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssessmentScoringService {
  constructor(private readonly prisma: PrismaService) {}

  /** Subject-specific weights take priority over a class-wide (subject: null) default set. */
  async getWeights(schoolId: string, classId: string, subject: string) {
    const specific = await this.prisma.assessmentWeight.findMany({ where: { schoolId, classId, subject } });
    if (specific.length > 0) return specific;
    return this.prisma.assessmentWeight.findMany({ where: { schoolId, classId, subject: null } });
  }

  async recordComponentScore(
    schoolId: string,
    studentId: string,
    termId: string,
    subject: string,
    componentName: string,
    score: number,
    source: 'CBT' | 'MANUAL',
  ) {
    await this.prisma.assessmentScore.upsert({
      where: { schoolId_studentId_termId_subject_componentName: { schoolId, studentId, termId, subject, componentName } },
      create: { schoolId, studentId, termId, subject, componentName, score, source },
      update: { score, source },
    });
  }

  /**
   * Recomputes the weighted final score and writes it into
   * ResultEntry.subjectScores. Returns null if no weight config exists
   * for this class/subject — callers must fall back to their own direct
   * write in that case, which preserves the exact pre-existing behavior
   * for every school that hasn't opted into weighting.
   *
   * If some but not all configured components have a score yet, this
   * projects the total from whatever's entered so far, scaled up — not
   * a silent guess: the frontend labels this as provisional until every
   * component is filled in.
   */
  async recomputeAndSync(schoolId: string, studentId: string, termId: string, subject: string) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { id: studentId } });
    const weights = await this.getWeights(schoolId, student.classId, subject);
    if (weights.length === 0) return null;

    const components = await this.prisma.assessmentScore.findMany({ where: { schoolId, studentId, termId, subject } });
    const scoreByComponent = new Map(components.map((c) => [c.componentName, c.score]));

    let weightedSum = 0;
    let weightPresent = 0;
    for (const w of weights) {
      const score = scoreByComponent.get(w.componentName);
      if (score !== undefined) {
        weightedSum += score * w.weightPercent;
        weightPresent += w.weightPercent;
      }
    }
    if (weightPresent === 0) return null;
    const finalScore = Math.round(weightedSum / weightPresent);

    const existing = await this.prisma.resultEntry.findFirst({ where: { schoolId, studentId, termId } });
    const subjectScores = { ...((existing?.subjectScores as Record<string, number>) ?? {}), [subject]: finalScore };
    await this.prisma.resultEntry.upsert({
      where: { schoolId_studentId_termId: { schoolId, studentId, termId } },
      create: { schoolId, studentId, termId, subjectScores, classTeacherId: existing?.classTeacherId ?? student.createdByStaffId },
      update: { subjectScores },
    });
    return { finalScore, isComplete: weightPresent === weights.reduce((s, w) => s + w.weightPercent, 0) };
  }

  listComponentScores(schoolId: string, studentId: string, termId: string, subject: string) {
    return this.prisma.assessmentScore.findMany({ where: { schoolId, studentId, termId, subject } });
  }
}