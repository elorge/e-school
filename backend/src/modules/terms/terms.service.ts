// backend/src/modules/terms/terms.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TermsService {
  constructor(private readonly prisma: PrismaService) {}

  findBySchool(schoolId: string) {
    return this.prisma.term.findMany({ where: { schoolId }, orderBy: { startDate: 'desc' } });
  }

  /** Distinct academic sessions on file — feeds the session-picker dropdown on the Session Wrap screen. */
  async listSessions(schoolId: string): Promise<string[]> {
    const terms = await this.prisma.term.findMany({
      where: { schoolId },
      distinct: ['academicSession'],
      select: { academicSession: true },
      orderBy: { academicSession: 'desc' },
    });
    return terms.map((t) => t.academicSession);
  }

  create(schoolId: string, name: string, academicSession: string, termNumber: number, startDate: string, endDate: string) {
    return this.prisma.term.create({
      data: { schoolId, name, academicSession, termNumber, startDate: new Date(startDate), endDate: new Date(endDate) },
    });
  }
}