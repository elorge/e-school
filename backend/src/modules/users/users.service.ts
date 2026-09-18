// backend/src/modules/users/users.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Scoped to a single school — used by School Admin's "manage staff" view.
  findBySchool(schoolId: string) {
    return this.prisma.user.findMany({ where: { schoolId } });
  }

  /**
   * Deletes a staff member. If they created any classes/students or are
   * a class's current teacher, those rows must be reassigned first
   * (createdByStaffId is a required FK — Postgres will reject the delete
   * otherwise). Pass reassignToStaffId to do both checks-and-reassign in
   * one call; omit it to get back a count of what needs reassigning.
   */
  async remove(schoolId: string, userId: string, reassignToStaffId?: string) {
    // An HR profile carries payroll/leave/attendance history that must
    // stay intact (payslips are a financial record — never silently
    // deletable). Rather than cascading through all of that, block the
    // account deletion outright and point the admin at the correct tool:
    // set employmentStatus to TERMINATED on the HR profile, which keeps
    // history while marking them as no longer active staff. The account
    // itself can still be removed afterwards once there's a real need to
    // free up the email address — at which point this same check re-runs.
    const staffProfile = await this.prisma.staffProfile.findUnique({ where: { userId } });
    if (staffProfile) {
      throw new BadRequestException({
        message:
          'This staff member has an HR profile with payroll/leave history. Set their employment status to TERMINATED from the Staff page instead of deleting the account.',
        code: 'HAS_STAFF_PROFILE',
      });
    }

    const [classesCreated, classesTeaching, studentsCreated] = await Promise.all([
      this.prisma.class.findMany({ where: { createdByStaffId: userId } }),
      this.prisma.class.findMany({ where: { classTeacherId: userId } }),
      this.prisma.student.findMany({ where: { createdByStaffId: userId } }),
    ]);

    const hasOwnedRecords = classesCreated.length > 0 || classesTeaching.length > 0 || studentsCreated.length > 0;

    if (hasOwnedRecords && !reassignToStaffId) {
      throw new BadRequestException({
        message: 'This staff member has owned records that must be reassigned before removal.',
        classesCreated: classesCreated.length,
        classesTeaching: classesTeaching.length,
        studentsCreated: studentsCreated.length,
      });
    }

    if (reassignToStaffId) {
      if (reassignToStaffId === userId) {
        throw new BadRequestException('Cannot reassign to the staff member being removed');
      }
      const replacement = await this.prisma.user.findUnique({ where: { id: reassignToStaffId } });
      if (!replacement || replacement.schoolId !== schoolId) {
        throw new NotFoundException('Reassignment target must be a staff member at the same school');
      }
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (classesCreated.length > 0) {
        await tx.class.updateMany({
          where: { createdByStaffId: userId },
          data: { createdByStaffId: reassignToStaffId! },
        });
      }
      if (classesTeaching.length > 0) {
        await tx.class.updateMany({
          where: { classTeacherId: userId },
          data: { classTeacherId: reassignToStaffId! },
        });
      }
      if (studentsCreated.length > 0) {
        await tx.student.updateMany({
          where: { createdByStaffId: userId },
          data: { createdByStaffId: reassignToStaffId! },
        });
      }
      await tx.user.delete({ where: { id: userId } });
    });

    return { removed: true, reassignedTo: reassignToStaffId ?? null };
  }
}
