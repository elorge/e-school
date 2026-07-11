// backend/src/modules/students/students.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StudentStatus, Role, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/auth.types';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

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
    // If a device is retrying an offline-queued registration that
    // actually succeeded last time (e.g. the response was lost even
    // though the write went through), this returns the existing row
    // instead of creating a second student for the same child.
    const existing = await this.prisma.student.findUnique({ where: { clientReferenceId } });
    if (existing) return existing;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const count = await tx.student.count({
        where: { schoolId, admissionYear: data.admissionYear, status: StudentStatus.ACTIVE },
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
}