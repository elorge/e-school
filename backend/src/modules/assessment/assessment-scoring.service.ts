// backend/src/modules/assessment/assessment-scoring.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type WeightResolutionLevel = 'term-subject' | 'subject-default' | 'term-classwide' | 'class-default' | 'unweighted';

@Injectable()
export class AssessmentScoringService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves weights by widening from most to least specific, and
   * reports which level actually matched — the coverage endpoint below
   * uses `level` to tell an admin whether a given term is genuinely
   * configured or just inheriting a wider default (or nothing at all).
   *   1. this subject,  this term    → 'term-subject'
   *   2. this subject,  every term   → 'subject-default'
   *   3. every subject, this term    → 'term-classwide'
   *   4. every subject, every term   → 'class-default'
   *   (nothing found)                → 'unweighted'
   */
  private async resolveWeights(schoolId: string, classId: string, subject: string, termId: string) {
    const attempts: { subject: string | null; termId: string | null; level: WeightResolutionLevel }[] = [
      { subject, termId, level: 'term-subject' },
      { subject, termId: null, level: 'subject-default' },
      { subject: null, termId, level: 'term-classwide' },
      { subject: null, termId: null, level: 'class-default' },
    ];
    for (const { level, ...where } of attempts) {
      const rows = await this.prisma.assessmentWeight.findMany({ where: { schoolId, classId, ...where } });
      if (rows.length > 0) return { level, weights: rows };
    }
    return { level: 'unweighted' as const, weights: [] };
  }

  async getWeights(schoolId: string, classId: string, subject: string, termId: string) {
    const { weights } = await this.resolveWeights(schoolId, classId, subject, termId);
    return weights;
  }

  /**
   * Per-term breakdown for the grading UI's coverage summary — shows an
   * admin, for the class/subject they're looking at, which terms have
   * their own weights, which are inheriting a default, and which have
   * nothing configured at all (→ unweighted, direct-score behavior).
   */
  async getCoverage(schoolId: string, classId: string, subject: string) {
    const terms = await this.prisma.term.findMany({ where: { schoolId }, orderBy: [{ academicSession: 'desc' }, { termNumber: 'asc' }] });
    const rows = await Promise.all(
      terms.map(async (term) => {
        const { level } = await this.resolveWeights(schoolId, classId, subject, term.id);
        return { termId: term.id, termName: term.name, level };
      }),
    );
    return rows;
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
   * for this class/subject/term, at any level of the fallback cascade —
   * callers must fall back to their own direct write in that case,
   * which preserves the exact pre-existing behavior for every school
   * that hasn't opted into weighting.
   *
   * If some but not all configured components have a score yet, this
   * projects the total from whatever's entered so far, scaled up — not
   * a silent guess: the frontend labels this as provisional until every
   * component is filled in.
   */
  async recomputeAndSync(schoolId: string, studentId: string, termId: string, subject: string) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { id: studentId } });
    const weights = await this.getWeights(schoolId, student.classId, subject, termId);
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