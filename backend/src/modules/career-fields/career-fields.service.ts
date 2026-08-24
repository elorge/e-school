// backend/src/modules/career-fields/career-fields.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CareerFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Global defaults (schoolId: null) + this school's own custom rows, for the school's "manage career fields" settings screen. */
  listForSchool(schoolId: string) {
    return this.prisma.subjectCareerField.findMany({
      where: { OR: [{ schoolId: null }, { schoolId }] },
      orderBy: [{ subject: 'asc' }, { field: 'asc' }],
    });
  }

  /**
   * Used by InsightsService — for a given school and set of subjects,
   * returns subject -> [fields], merging global defaults with anything
   * this school added on top. A school-specific row for a subject the
   * global list already covers just adds to it, never replaces it.
   */
  async getFieldsBySubject(schoolId: string, subjects: string[]): Promise<Map<string, string[]>> {
    if (subjects.length === 0) return new Map();
    const rows = await this.prisma.subjectCareerField.findMany({
      where: { subject: { in: subjects }, OR: [{ schoolId: null }, { schoolId }] },
    });
    const map = new Map<string, string[]>();
    for (const row of rows) {
      if (!map.has(row.subject)) map.set(row.subject, []);
      const fields = map.get(row.subject)!;
      if (!fields.includes(row.field)) fields.push(row.field);
    }
    return map;
  }

  /** SCHOOL_ADMIN adding a mapping for a subject their curriculum uses that the global defaults don't cover. Idempotent — adding the same pair twice is a no-op. */
  addSchoolMapping(schoolId: string, subject: string, field: string) {
    return this.prisma.subjectCareerField.upsert({
      where: { schoolId_subject_field: { schoolId, subject, field } },
      create: { schoolId, subject, field },
      update: {},
    });
  }

  /** Scoped to schoolId on purpose — a school can only ever delete its OWN custom rows, never a global default (those have schoolId: null and simply won't match). */
  async removeSchoolMapping(schoolId: string, id: string) {
    const row = await this.prisma.subjectCareerField.findFirst({ where: { id, schoolId } });
    if (!row) return { removed: false };
    await this.prisma.subjectCareerField.delete({ where: { id } });
    return { removed: true };
  }
}