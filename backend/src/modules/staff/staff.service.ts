// backend/src/modules/staff/staff.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { EmploymentStatus, IdCardRequestStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import { UpdateMyStaffProfileDto } from './dto/update-my-staff-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';
import { decimalPlacesFor } from '../../common/utils/currency.util';
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
   * Next sequential staff id ("GRW/STAFF/0007"). Takes the highest existing
   * number + 1 rather than COUNT + 1, so deleting/renumbering a profile can
   * never cause a duplicate-id collision. Must be called inside the
   * advisory-locked transaction (see createProfile / ensureProfile).
   */
  private async nextStaffId(tx: Prisma.TransactionClient, schoolId: string, schoolCode: string) {
    const existing = await tx.staffProfile.findMany({ where: { schoolId }, select: { staffId: true } });
    const max = existing.reduce((m, p) => {
      const n = parseInt(p.staffId.split('/').pop() ?? '0', 10);
      return Number.isFinite(n) && n > m ? n : m;
    }, 0);
    return `${schoolCode}/STAFF/${String(max + 1).padStart(4, '0')}`;
  }

  /**
   * Admin onboarding of a user into HR with full details. Only a
   * SCHOOL_ADMIN reaches this (controller @Roles) — staff never create or
   * grant anything, they only edit their own limited details later.
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

      const staffId = await this.nextStaffId(tx, schoolId, schoolCode);

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
          nextOfKinRelationship: dto.nextOfKinRelationship,
          maritalStatus: dto.maritalStatus,
          stateOfOrigin: dto.stateOfOrigin,
          qualifications: dto.qualifications,
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

  /**
   * Guarantees a bare StaffProfile exists for a login account (admin or
   * staff). Idempotent and race-safe: several "my ..." requests fire in
   * parallel when a page loads, and the advisory lock makes the second one
   * simply return the row the first one created. Pay is left at 0 and the
   * rest blank — the admin fills in HR details, the person fills in their
   * own personal details.
   *
   * This is what removes the old dead-end "Your HR profile hasn't been set
   * up yet" for the school admin (who is never invited via the staff flow).
   */
  async ensureProfile(schoolId: string, userId: string) {
    const found = await this.prisma.staffProfile.findFirst({ where: { userId, schoolId }, include: PROFILE_INCLUDE });
    if (found) return found;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.schoolId !== schoolId || (user.role !== Role.SCHOOL_ADMIN && user.role !== Role.STAFF)) {
      throw new NotFoundException('No staff profile exists for this account');
    }
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId }, select: { code: true } });

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${schoolId} || '-staff-id'))`;
      const again = await tx.staffProfile.findUnique({ where: { userId }, include: PROFILE_INCLUDE });
      if (again) return again;

      const staffId = await this.nextStaffId(tx, schoolId, school.code);
      return tx.staffProfile.create({
        data: {
          schoolId,
          userId,
          staffId,
          designation: user.role === Role.SCHOOL_ADMIN ? 'School Administrator' : undefined,
          allowances: [] as unknown as Prisma.InputJsonValue,
          deductions: [] as unknown as Prisma.InputJsonValue,
        },
        include: PROFILE_INCLUDE,
      });
    });
  }

  /** Creates a profile for every admin/staff login that doesn't have one, so the directory (and payroll after pay is set) always covers everyone. */
  private async backfillMissingProfiles(schoolId: string) {
    const missing = await this.listUnprofiledUsers(schoolId);
    for (const u of missing) {
      await this.ensureProfile(schoolId, u.id);
    }
  }

  async listAll(schoolId: string, employmentStatus?: EmploymentStatus) {
    await this.backfillMissingProfiles(schoolId);
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

  /**
   * Every staff member's bank details in one Excel sheet, for the admin to extract and pay from. Independent of
   * any payroll run. Columns: staff id, name, contact, department/designation, status, bank name, account number,
   * account name, expected monthly net pay, and whether the bank details are complete. Account numbers are kept
   * as text so leading zeros survive. Staff who haven't added bank details are listed too (flagged "Missing") so
   * the admin can chase them.
   */
  async exportBankDetailsXlsx(schoolId: string): Promise<Buffer> {
    await this.backfillMissingProfiles(schoolId);
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId }, select: { currency: true, name: true } });
    const divisor = 10 ** decimalPlacesFor(school.currency);
    const sum = (items: unknown) =>
      Array.isArray(items) ? items.reduce((t: number, i: { amountKobo?: number }) => t + (Number(i?.amountKobo) || 0), 0) : 0;

    const profiles = await this.prisma.staffProfile.findMany({
      where: { schoolId },
      include: { user: { select: { fullName: true, email: true, role: true } } },
      orderBy: { staffId: 'asc' },
    });

    const rows = profiles.map((p) => {
      const complete = !!(p.bankName && p.bankAccountNumber && p.bankAccountName);
      const net = p.baseSalaryKobo + sum(p.allowances) - sum(p.deductions);
      return {
        'Staff ID': p.staffId,
        'Full Name': p.user.fullName,
        Role: p.user.role === Role.SCHOOL_ADMIN ? 'Admin' : 'Staff',
        Department: p.department ?? '',
        Designation: p.designation ?? '',
        'Employment Status': p.employmentStatus,
        Email: p.user.email,
        Phone: p.phone ?? '',
        'Bank Name': p.bankName ?? '',
        'Account Number': p.bankAccountNumber ?? '',
        'Account Name': p.bankAccountName ?? '',
        'Monthly Net Pay': net / divisor,
        Currency: school.currency,
        'Bank Details': complete ? 'Complete' : 'Missing',
      };
    });

    const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: 'No staff yet.' }]);
    rows.forEach((_r, i) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: i + 1, c: 9 })];
      if (cell) {
        cell.t = 's';
        cell.z = '@';
      }
    });
    sheet['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 8 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 26 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 24 }, { wch: 16 }, { wch: 9 }, { wch: 13 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Staff bank details');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /** The caller's own profile — created on first use if it doesn't exist yet (see ensureProfile). */
  findByUserId(schoolId: string, userId: string) {
    return this.ensureProfile(schoolId, userId);
  }

  /**
   * Staff self-service: edits ONLY the whitelisted personal fields in
   * UpdateMyStaffProfileDto, on the caller's own profile (resolved from the
   * JWT — no id is accepted from the client). Admin is told when bank
   * details change, since that's the field payroll pays into.
   */
  async updateMine(schoolId: string, userId: string, dto: UpdateMyStaffProfileDto) {
    const profile = await this.ensureProfile(schoolId, userId);

    const text = (v: string | undefined) => (v === undefined ? undefined : v.trim() === '' ? null : v.trim());
    const data: Prisma.StaffProfileUpdateInput = {
      phone: text(dto.phone),
      address: text(dto.address),
      gender: text(dto.gender),
      maritalStatus: text(dto.maritalStatus),
      stateOfOrigin: text(dto.stateOfOrigin),
      qualifications: text(dto.qualifications),
      nextOfKinName: text(dto.nextOfKinName),
      nextOfKinPhone: text(dto.nextOfKinPhone),
      nextOfKinRelationship: text(dto.nextOfKinRelationship),
      bankName: text(dto.bankName),
      bankAccountName: text(dto.bankAccountName),
      bankAccountNumber: text(dto.bankAccountNumber),
      dateOfBirth: dto.dateOfBirth === undefined ? undefined : dto.dateOfBirth === '' ? null : new Date(dto.dateOfBirth),
    };

    const updated = await this.prisma.staffProfile.update({ where: { id: profile.id }, data, include: PROFILE_INCLUDE });

    const changedFields = Object.keys(dto).filter((k) => (dto as Record<string, unknown>)[k] !== undefined);
    const bankChanged = ['bankName', 'bankAccountName', 'bankAccountNumber'].some((k) => changedFields.includes(k));

    await this.audit.log({
      schoolId,
      actorId: userId,
      action: 'staff_profile.self_updated',
      entityType: 'StaffProfile',
      entityId: profile.id,
      metadata: { fields: changedFields },
    });
    if (bankChanged) {
      await this.notifyReviewers(schoolId, 'Staff bank details changed', `${updated.user.fullName} updated their bank details.`, `/admin/staff/${profile.id}`);
    }
    return updated;
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
        nextOfKinRelationship: dto.nextOfKinRelationship,
        maritalStatus: dto.maritalStatus,
        stateOfOrigin: dto.stateOfOrigin,
        qualifications: dto.qualifications,
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

  // ─── Staff ID card requests (staff asks → admin/HR approves → card issued) ───

  /** Latest issued card (if any) plus the staff member's request history — drives the "My ID card" section on My Info. */
  async getMyIdCardStatus(schoolId: string, userId: string) {
    const profile = await this.findByUserId(schoolId, userId);
    const [card, requests] = await Promise.all([
      this.prisma.staffIdCard.findFirst({ where: { schoolId, staffProfileId: profile.id }, orderBy: { issuedAt: 'desc' } }),
      this.prisma.staffIdCardRequest.findMany({ where: { schoolId, staffProfileId: profile.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    return { profileId: profile.id, hasPhoto: !!profile.photoUrl, card: card ? { issuedAt: card.issuedAt } : null, requests };
  }

  async requestIdCard(schoolId: string, userId: string, reason: string | undefined) {
    const profile = await this.findByUserId(schoolId, userId);
    if (!profile.photoUrl) {
      throw new BadRequestException('Add your photo on My Info before requesting an ID card');
    }
    if (profile.user.role === Role.SCHOOL_ADMIN) {
      const others = await this.prisma.user.count({ where: { schoolId, role: Role.SCHOOL_ADMIN, id: { not: userId } } });
      if (others === 0) {
        throw new ConflictException('Your ID card must be approved by another school admin, and this school has only one. Add a second admin first.');
      }
    }
    const pending = await this.prisma.staffIdCardRequest.findFirst({
      where: { schoolId, staffProfileId: profile.id, status: IdCardRequestStatus.PENDING },
    });
    if (pending) throw new ConflictException('You already have an ID card request awaiting approval');

    const request = await this.prisma.staffIdCardRequest.create({
      data: { schoolId, staffProfileId: profile.id, reason: reason?.trim() || undefined },
    });

    await this.notifyReviewers(schoolId, 'New staff ID card request', `${profile.user.fullName} has requested a staff ID card.`, '/admin/staff/id-cards', userId);
    return request;
  }

  async cancelIdCardRequest(schoolId: string, userId: string, requestId: string) {
    const profile = await this.findByUserId(schoolId, userId);
    const request = await this.prisma.staffIdCardRequest.findFirst({ where: { id: requestId, schoolId, staffProfileId: profile.id } });
    if (!request) throw new NotFoundException('ID card request not found');
    if (request.status !== IdCardRequestStatus.PENDING) throw new ConflictException('Only a pending request can be cancelled');
    return this.prisma.staffIdCardRequest.update({ where: { id: requestId }, data: { status: IdCardRequestStatus.CANCELLED } });
  }

  listIdCardRequests(schoolId: string, status?: IdCardRequestStatus) {
    return this.prisma.staffIdCardRequest.findMany({
      where: { schoolId, ...(status ? { status } : {}) },
      include: {
        staffProfile: {
          select: { id: true, userId: true, staffId: true, photoUrl: true, designation: true, department: true, user: { select: { fullName: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Approving issues a fresh StaffIdCard in the same step, so "approved" always means "printable". */
  async reviewIdCardRequest(schoolId: string, requestId: string, approve: boolean, reviewerId: string, reviewNote?: string) {
    const request = await this.prisma.staffIdCardRequest.findFirst({
      where: { id: requestId, schoolId },
      include: { staffProfile: true },
    });
    if (!request) throw new NotFoundException('ID card request not found');
    if (request.status !== IdCardRequestStatus.PENDING) throw new ConflictException('This request has already been reviewed');
    if (request.staffProfile.userId === reviewerId) {
      throw new ForbiddenException('You cannot approve or decline your own ID card request — another school admin must review it');
    }

    if (approve) {
      await this.issueIdCard(schoolId, request.staffProfileId);
    }
    const updated = await this.prisma.staffIdCardRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? IdCardRequestStatus.APPROVED : IdCardRequestStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    await this.notifications.notifyUsers(
      [request.staffProfile.userId],
      approve ? 'ID card approved' : 'ID card request declined',
      approve ? 'Your staff ID card is ready — you can print it from My Info.' : `Your ID card request was declined${reviewNote ? `: ${reviewNote}` : '.'}`,
      '/staff/me',
    );
    await this.audit.log({
      schoolId,
      actorId: reviewerId,
      action: approve ? 'staff_id_card_request.approved' : 'staff_id_card_request.rejected',
      entityType: 'StaffIdCardRequest',
      entityId: requestId,
      metadata: { reviewNote },
    });
    return updated;
  }

  /** Tells every school admin (the sole approver for HR matters). */
  private async notifyReviewers(schoolId: string, title: string, body: string, link = '/admin/staff/id-cards', excludeUserId?: string) {
    const admins = await this.prisma.user.findMany({
      where: { schoolId, role: Role.SCHOOL_ADMIN, ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
      select: { id: true },
    });
    await this.notifications.notifyUsers(admins.map((a) => a.id), title, body, link);
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
