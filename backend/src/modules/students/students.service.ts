// backend/src/modules/students/students.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, StudentStatus, Role } from '@prisma/client';
import { IdCardsService } from '../id-cards/id-cards.service';
import { AuthenticatedUser } from '../../common/types/auth.types';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService, private readonly idCardsService: IdCardsService) {}

  findBySchool(schoolId: string, classId?: string, includeWithdrawn = false) {
    return this.prisma.student.findMany({
      where: {
        schoolId,
        ...(classId ? { classId } : {}),
        ...(includeWithdrawn ? {} : { status: { not: StudentStatus.WITHDRAWN } }),
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findByIdOrThrow(schoolId: string, id: string) {
    const student = await this.prisma.student.findFirst({ where: { id, schoolId } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  findPendingSync(schoolId: string) {
    return this.prisma.student.findMany({
      where: { schoolId, status: StudentStatus.PENDING_ID },
    });
  }

  /**
   * Creates a student record and immediately assigns its sequential
   * Admission ID within the same transaction. This IS the offline-sync
   * entry point (spec doc §9.1/§5): a staff device queues the record
   * locally while offline, then POSTs it here once reconnected; the
   * server is the single source of truth for the sequential id, which is
   * never generated on-device.
   *
   * Postgres's default transaction isolation combined with the
   * COUNT-then-INSERT pattern here is enough for moderate concurrency; if
   * two syncs for the same school+year land at the exact same instant
   * under high load, replace the count with a
   * `SELECT ... FOR UPDATE` on a per-school-year counter row for a
   * stronger guarantee.
   */
async createAndAssignId(
  schoolId: string,
  schoolCode: string,
  classId: string,
  createdByStaffId: string,
  clientReferenceId: string,
  data: { firstName: string; lastName: string; photoUrl?: string; admissionYear: number },
) {
  return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Two locks: one serializes sequence-number assignment per
    // school+year; the other serializes concurrent retries of this
    // exact registration (e.g. two sync loops firing at once). Both
    // must be inside the transaction — checking "does this already
    // exist?" before acquiring any lock is what let two concurrent
    // requests for the same clientReferenceId both pass the check
    // and then collide on insert.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${schoolId} || ${data.admissionYear}))`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${clientReferenceId}))`;

    const existing = await tx.student.findUnique({ where: { clientReferenceId } });
    if (existing) return existing;

    const count = await tx.student.count({
      where: { schoolId, admissionYear: data.admissionYear },
    });
    const sequence = String(count + 1).padStart(4, '0');
    const studentId = `${schoolCode}/${data.admissionYear}/${sequence}`;

    return tx.student.create({
      data: {
        schoolId,
        classId,
        createdByStaffId,
        clientReferenceId,
        firstName: data.firstName,
        lastName: data.lastName,
        photoUrl: data.photoUrl,
        admissionYear: data.admissionYear,
        studentId,
        status: StudentStatus.ACTIVE,
      },
    });
  });
}

  /** Called right after a student row exists — separate from the transaction above since ID card issuance shouldn't block/rollback registration if it fails for any reason. */
  async ensureIdCard(schoolId: string, studentId: string) {
    return this.idCardsService.issueCard(schoolId, studentId);
  }

  /**
   * Class teacher (or School Admin) removes a student no longer in their
   * class. Soft-delete: sets status to WITHDRAWN rather than deleting the
   * row, so ResultEntry/AttendanceRecord history stays intact.
   */
  async withdraw(schoolId: string, studentId: string, caller: AuthenticatedUser) {
    const student = await this.findByIdOrThrow(schoolId, studentId);
    const klass = await this.prisma.class.findUniqueOrThrow({ where: { id: student.classId } });

    if (caller.role === Role.STAFF && klass.classTeacherId !== caller.id) {
      throw new ForbiddenException("Only this class's teacher or a School Admin can remove this student");
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { status: StudentStatus.WITHDRAWN },
    });
  }

  generateImportTemplate(): Buffer {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['First Name', 'Last Name', 'Admission Year', 'Class Name (must match exactly)'],
      ['Ada', 'Obi', 2025, 'JSS 1'],
    ]);
    worksheet['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 24 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async bulkImport(schoolId: string, schoolCode: string, createdByStaffId: string, fileBuffer: Buffer) {
    const classes = await this.prisma.class.findMany({ where: { schoolId } });
    const classByName = new Map(classes.map((c) => [c.name.trim().toLowerCase(), c.id]));

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = (XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false }) as any[][]).slice(1);

    const added: string[] = [];
    const errors: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const [firstName, lastName, admissionYear, className] = rows[i];
      const rowNumber = i + 2;
      if (!firstName || !lastName) {
        errors.push({ row: rowNumber, reason: 'Missing first or last name' });
        continue;
      }
      const classId = classByName.get(String(className ?? '').trim().toLowerCase());
      if (!classId) {
        errors.push({ row: rowNumber, reason: `Class "${className}" not found — check spelling matches exactly` });
        continue;
      }
      const year = Number(admissionYear);
      if (!Number.isFinite(year) || year < 2000 || year > 2100) {
        errors.push({ row: rowNumber, reason: 'Invalid admission year' });
        continue;
      }

      try {
        const student = await this.createAndAssignId(schoolId, schoolCode, classId, createdByStaffId, randomUUID(), {
          firstName: String(firstName).trim(),
          lastName: String(lastName).trim(),
          admissionYear: year,
        });
        added.push(student.studentId ?? student.id);
      } catch (err) {
        errors.push({ row: rowNumber, reason: 'Could not create this student — try again' });
      }
    }

    return { addedCount: added.length, errors };
  }
}