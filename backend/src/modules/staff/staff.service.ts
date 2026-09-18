// backend/src/modules/staff/staff.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmploymentStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';
import { ATTENDANCE_MAX_BACKDATE_HOURS, ATTENDANCE_MAX_FUTURE_MINUTES } from '../../common/constants';

const PROFILE_INCLUDE = {
  user: { select: { id: true, email: true, fullName: true, role: true, createdAt: true } },
} satisfies Prisma.StaffProfileInclude;

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Every User with role SCHOOL_ADMIN or STAFF at this school that does
   * NOT yet have a StaffProfile — the pool an admin picks from when
   * onboarding someone into HR. A login account can exist for a while
   * (e.g. right after AuthService.inviteStaff) before HR data is filled
   * in; this is what makes that gap visible in the UI.
   */
  async listUnprofiledUsers(schoolId: string) {
    return this.prisma.user.findMany({
      where: {
        schoolId,
        role: { in: [Role.SCHOOL_ADMIN, Role.STAFF] },
        staffProfile: null,
      },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Sequential staff id, same COUNT-then-INSERT-under-advisory-lock
   * pattern as Student.studentId (see StudentsService.createAndAssignId)
   * — moderate concurrency is all this needs since HR onboarding is a
   * low-frequency, admin-driven action, never a high-volume sync path.
   */
  async createProfile(schoolId: string, schoolCode: string, dto: CreateStaffProfileDto, actorId: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!targetUser || targetUser.schoolId !== schoolId) {
      throw new NotFoundException('User does not belong to this school');
    }
    if (targetUser.role !== Role.SCHOOL_ADMIN && targetUser.role !== Role.STAFF) {
      throw new BadRequestException('Only school admins and staff accounts can have an HR profile');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${schoolId} || '-staff-id'))`;

      const existing = await tx.staffProfile.findUnique({ where: { userId: dto.userId } });
      if (existing) throw new ConflictException('This user already has a staff profile');

      const count = await tx.staffProfile.count({ where: { schoolId } });
      const sequence = String(count + 1).padStart(4, '0');
      const staffId = `${schoolCode}/STAFF/${sequence}`;

      const profile = await tx.staffProfile.create({
        data: {
          schoolId,
          userId: dto.userId,
          staffId,
          department: dto.department,
          designation: dto.designation,
          employmentType: dto.employmentType,
          dateOfEmployment: dto.dateOfEmployment ? new Date(dto.dateOfEmployment) : undefined,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          phone: dto.phone,
          address: dto.address,
          nextOfKinName: dto.nextOfKinName,
          nextOfKinPhone: dto.nextOfKinPhone,
          bankName: dto.bankName,
          bankAccountName: dto.bankAccountName,
          bankAccountNumber: dto.bankAccountNumber,
          photoUrl: dto.photoUrl,
          baseSalaryKobo: dto.baseSalaryKobo ?? 0,
          allowances: (dto.allowances ?? []) as unknown as Prisma.InputJsonValue,
          deductions: (dto.deductions ?? []) as unknown as Prisma.InputJsonValue,
        },
        include: PROFILE_INCLUDE,
      });

      await this.audit.log({
        schoolId,
        actorId,
        action: 'staff_profile.created',
        entityType: 'StaffProfile',
        entityId: profile.id,
        metadata: { staffId },
      });

      return profile;
    });
  }

  listAll(schoolId: string, employmentStatus?: EmploymentStatus) {
    return this.prisma.staffProfile.findMany({
      where: { schoolId, ...(employmentStatus ? { employmentStatus } : {}) },
      include: PROFILE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const profile = await this.prisma.staffProfile.findFirst({ where: { id, schoolId }, include: PROFILE_INCLUDE });
    if (!profile) throw new NotFoundException('Staff profile not found');
    return profile;
  }

  async findByUserId(schoolId: string, userId: string) {
    const profile = await this.prisma.staffProfile.findFirst({ where: { userId, schoolId }, include: PROFILE_INCLUDE });
    if (!profile) throw new NotFoundException('No staff profile exists for this account yet');
    return profile;
  }

  async update(schoolId: string, id: string, dto: UpdateStaffProfileDto, actorId: string) {
    await this.findOne(schoolId, id);

    const profile = await this.prisma.staffProfile.update({
      where: { id },
      data: {
        department: dto.department,
        designation: dto.designation,
        employmentType: dto.employmentType,
        employmentStatus: dto.employmentStatus,
        dateOfEmployment: dto.dateOfEmployment ? new Date(dto.dateOfEmployment) : undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        phone: dto.phone,
        address: dto.address,
        nextOfKinName: dto.nextOfKinName,
        nextOfKinPhone: dto.nextOfKinPhone,
        bankName: dto.bankName,
        bankAccountName: dto.bankAccountName,
        bankAccountNumber: dto.bankAccountNumber,
        photoUrl: dto.photoUrl,
        baseSalaryKobo: dto.baseSalaryKobo,
        allowances: dto.allowances !== undefined ? (dto.allowances as unknown as Prisma.InputJsonValue) : undefined,
        deductions: dto.deductions !== undefined ? (dto.deductions as unknown as Prisma.InputJsonValue) : undefined,
      },
      include: PROFILE_INCLUDE,
    });

    await this.audit.log({
      schoolId,
      actorId,
      action: 'staff_profile.updated',
      entityType: 'StaffProfile',
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });

    return profile;
  }

  // ─── Staff ID cards ─────────────────────────────────────────────────
  // Separate visual identity from student cards on purpose (landscape
  // layout, department/designation instead of class) — see
  // StaffIdCardsService.renderIdCardPdf.

  async issueIdCard(schoolId: string, staffProfileId: string) {
    const profile = await this.findOne(schoolId, staffProfileId);
    const qrCode = `eschools-staff:${schoolId}:${profile.id}`;
    return this.prisma.staffIdCard.create({ data: { schoolId, staffProfileId: profile.id, qrCode } });
  }

  // ─── Staff attendance (gate scan, same clamp rules as student scans) ─

  async logAttendance(
    schoolId: string,
    staffProfileId: string,
    direction: 'CLOCK_IN' | 'CLOCK_OUT',
    occurredAtIso: string,
    clientReferenceId: string,
  ) {
    const existing = await this.prisma.staffAttendanceRecord.findUnique({ where: { clientReferenceId } });
    if (existing) return existing;

    const occurredAt = new Date(occurredAtIso);
    const now = new Date();
    const earliestAllowed = new Date(now.getTime() - ATTENDANCE_MAX_BACKDATE_HOURS * 60 * 60 * 1000);
    const latestAllowed = new Date(now.getTime() + ATTENDANCE_MAX_FUTURE_MINUTES * 60 * 1000);
    if (occurredAt < earliestAllowed || occurredAt > latestAllowed) {
      throw new BadRequestException(
        `Scan timestamp is outside the accepted window (max ${ATTENDANCE_MAX_BACKDATE_HOURS}h in the past, ${ATTENDANCE_MAX_FUTURE_MINUTES}m in the future)`,
      );
    }

    return this.prisma.staffAttendanceRecord.create({
      data: { schoolId, staffProfileId, direction, source: 'qr', occurredAt, clientReferenceId },
    });
  }

  listAttendance(schoolId: string, staffProfileId: string) {
    return this.prisma.staffAttendanceRecord.findMany({
      where: { schoolId, staffProfileId },
      orderBy: { occurredAt: 'desc' },
    });
  }
}
