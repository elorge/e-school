// backend/src/modules/lesson-notes/lesson-notes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';
import { LessonNoteStatus } from '@prisma/client';

@Injectable()
export class LessonNotesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Staff-facing (sees drafts too) ────────────────────────────────────
  findAllForStaff(schoolId: string, classId?: string, termId?: string) {
    return this.prisma.lessonNote.findMany({
      where: { schoolId, ...(classId ? { classId } : {}), ...(termId ? { termId } : {}) },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneOrThrow(schoolId: string, id: string) {
    const note = await this.prisma.lessonNote.findFirst({ where: { id, schoolId } });
    if (!note) throw new NotFoundException('Lesson note not found');
    return note;
  }

  create(schoolId: string, staffId: string, dto: CreateLessonNoteDto) {
    return this.prisma.lessonNote.create({ data: { schoolId, createdByStaffId: staffId, ...dto, status: LessonNoteStatus.DRAFT } });
  }

  async update(schoolId: string, id: string, dto: UpdateLessonNoteDto) {
    await this.findOneOrThrow(schoolId, id);
    return this.prisma.lessonNote.update({ where: { id }, data: dto });
  }

  async setStatus(schoolId: string, id: string, status: LessonNoteStatus) {
    await this.findOneOrThrow(schoolId, id);
    return this.prisma.lessonNote.update({ where: { id }, data: { status } });
  }

  async remove(schoolId: string, id: string) {
    await this.findOneOrThrow(schoolId, id);
    return this.prisma.lessonNote.delete({ where: { id } });
  }

  /**
   * Verifies an Admission ID belongs to an ACTIVE student in this
   * school, then returns which classId they're in — used to scope both
   * listing and single-note lookup below. Deliberately does NOT touch
   * PinLookupAttempt or any PIN — a lesson note isn't a result, keeping
   * these credential systems separate on purpose (see design note from
   * the CBT access-code decision).
   */
  private async resolveStudentClass(schoolId: string, admissionId: string): Promise<string> {
    const student = await this.prisma.student.findFirst({
      where: { schoolId, studentId: admissionId, status: 'ACTIVE' },
      select: { classId: true },
    });
    if (!student) throw new NotFoundException('Admission ID not recognized');
    return student.classId;
  }

  // ── Public (students at home) — PUBLISHED only, gated by Admission ID ──
  async findPublicList(schoolId: string, admissionId: string, subject?: string) {
    const classId = await this.resolveStudentClass(schoolId, admissionId);
    return this.prisma.lessonNote.findMany({
      where: { schoolId, status: LessonNoteStatus.PUBLISHED, classId, ...(subject ? { subject } : {}) },
      select: { id: true, subject: true, topic: true, classId: true, class: { select: { name: true } }, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findPublicOne(schoolId: string, id: string, admissionId: string) {
    const classId = await this.resolveStudentClass(schoolId, admissionId);
    const note = await this.prisma.lessonNote.findFirst({
      where: { id, schoolId, status: LessonNoteStatus.PUBLISHED, classId },
      include: { class: { select: { name: true } } },
    });
    // Same NotFound whether the note doesn't exist, is a draft, OR
    // belongs to a different class — a student from another class
    // shouldn't be able to tell which case it is by trying the link.
    if (!note) throw new NotFoundException('Lesson note not found, or not available to your class');
    return note;
  }
}