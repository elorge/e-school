// backend/src/modules/subjects/subjects.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── School-wide catalog ────────────────────────────────────────────────
  listCatalog(schoolId: string) {
    return this.prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
  }

  async createInCatalog(schoolId: string, name: string) {
    const existing = await this.prisma.subject.findFirst({ where: { schoolId, name: { equals: name, mode: 'insensitive' } } });
    if (existing) throw new ConflictException(`"${name}" already exists in the subject catalog`);
    return this.prisma.subject.create({ data: { schoolId, name } });
  }

  async removeFromCatalog(schoolId: string, subjectId: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, schoolId } });
    if (!subject) return;
    // Cascade the class assignments too — a subject removed from the
    // catalog entirely shouldn't leave orphaned class links behind.
    await this.prisma.classSubject.deleteMany({ where: { subjectId } });
    return this.prisma.subject.delete({ where: { id: subjectId } });
  }

  // ── Per-class assignment ────────────────────────────────────────────────
  listForClass(schoolId: string, classId: string) {
    return this.prisma.classSubject.findMany({
      where: { classId, subject: { schoolId } },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });
  }

  async assignToClass(schoolId: string, classId: string, subjectId: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, schoolId } });
    if (!subject) throw new ConflictException('Subject not found in this school\'s catalog');

    const existing = await this.prisma.classSubject.findUnique({ where: { classId_subjectId: { classId, subjectId } } });
    if (existing) return existing; // idempotent — assigning twice is a no-op, not an error

    return this.prisma.classSubject.create({ data: { classId, subjectId } });
  }

  async removeFromClass(classId: string, subjectId: string) {
    return this.prisma.classSubject.deleteMany({ where: { classId, subjectId } });
  }
}