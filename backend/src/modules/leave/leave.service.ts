// backend/src/modules/leave/leave.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LeaveStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeaveRequestDto, CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave.dto';
import { DEFAULT_LEAVE_TYPES } from '../../common/constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_LEAVE_TYPES = 30;

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Lists the school's leave types. A school with none at all (e.g. one
   * created before defaults existed) is seeded with the standard set on the
   * spot, so Sick / Study / Maternity etc. are never missing from the picker.
   */
  async listTypes(schoolId: string) {
    const types = await this.prisma.leaveType.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
    if (types.length > 0) return types;
    return this.seedDefaultTypes(schoolId);
  }

  async createType(schoolId: string, dto: CreateLeaveTypeDto) {
    const name = dto.name.trim();
    const clash = await this.prisma.leaveType.findFirst({ where: { schoolId, name: { equals: name, mode: 'insensitive' } } });
    if (clash) throw new ConflictException(`"${clash.name}" already exists`);
    return this.prisma.leaveType.create({ data: { schoolId, name, defaultDaysPerYear: dto.defaultDaysPerYear ?? 0 } });
  }

  async updateType(schoolId: string, id: string, dto: UpdateLeaveTypeDto) {
    const type = await this.prisma.leaveType.findFirst({ where: { id, schoolId } });
    if (!type) throw new NotFoundException('Leave type not found');
    const name = dto.name?.trim();
    if (name && name.toLowerCase() !== type.name.toLowerCase()) {
      const clash = await this.prisma.leaveType.findFirst({ where: { schoolId, name: { equals: name, mode: 'insensitive' }, NOT: { id } } });
      if (clash) throw new ConflictException(`"${clash.name}" already exists`);
    }
    // Only newly-created balances use the new default; balances already issued this year keep their allotment.
    return this.prisma.leaveType.update({ where: { id }, data: { name, defaultDaysPerYear: dto.defaultDaysPerYear } });
  }

  /** A type that has ever been requested stays (history must keep its label); an unused one can be removed. */
  async deleteType(schoolId: string, id: string) {
    const type = await this.prisma.leaveType.findFirst({ where: { id, schoolId } });
    if (!type) throw new NotFoundException('Leave type not found');
    const used = await this.prisma.leaveRequest.count({ where: { leaveTypeId: id } });
    if (used > 0) throw new ConflictException('This leave type has requests on record and cannot be deleted');
    await this.prisma.$transaction([
      this.prisma.staffLeaveBalance.deleteMany({ where: { leaveTypeId: id } }),
      this.prisma.leaveType.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  /**
   * Creates the standard leave-type set (see DEFAULT_LEAVE_TYPES) for a
   * school. Called automatically on school creation (SchoolsService.create)
   * and exposed as a manual "seed defaults" action for schools that
   * predate this (e.g. an existing demo/seeded school with none yet).
   * skipDuplicates makes this safe to call more than once — a school
   * that already renamed/removed some types never gets them force-added
   * back, since @@unique([schoolId, name]) means only genuinely-missing
   * names get created.
   */
  async seedDefaultTypes(schoolId: string) {
    await this.prisma.leaveType.createMany({
      data: DEFAULT_LEAVE_TYPES.map((t) => ({ schoolId, name: t.name, defaultDaysPerYear: t.defaultDaysPerYear })),
      skipDuplicates: true,
    });
    return this.prisma.leaveType.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
  }

  /** Other school admins who can review a request raised by `userId`. */
  private otherAdmins(schoolId: string, userId: string) {
    return this.prisma.user.findMany({ where: { schoolId, role: Role.SCHOOL_ADMIN, id: { not: userId } }, select: { id: true } });
  }

  /** Lazily provisioned per staff/type/year — see StaffLeaveBalance docstring in schema.prisma. */
  private async getOrCreateBalance(tx: Prisma.TransactionClient, staffProfileId: string, leaveTypeId: string, schoolId: string, year: number) {
    const existing = await tx.staffLeaveBalance.findUnique({
      where: { staffProfileId_leaveTypeId_year: { staffProfileId, leaveTypeId, year } },
    });
    if (existing) return existing;

    const leaveType = await tx.leaveType.findUniqueOrThrow({ where: { id: leaveTypeId } });
    return tx.staffLeaveBalance.create({
      data: { schoolId, staffProfileId, leaveTypeId, year, daysAllotted: leaveType.defaultDaysPerYear, daysUsed: 0 },
    });
  }

  async myBalances(schoolId: string, staffProfileId: string, year: number) {
    const types = await this.listTypes(schoolId);
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const balances = [];
      for (const type of types) {
        balances.push(await this.getOrCreateBalance(tx, staffProfileId, type.id, schoolId, year));
      }
      return balances;
    });
  }

  /**
   * Staff pick a listed type or type their own. Guardrails so the list stays clean:
   *  - a typed name is matched case-insensitively against existing types first
   *    ("sick leave" never duplicates "Sick Leave"), ignoring extra spaces;
   *  - it must look like a leave name (letters, numbers, spaces and - & / ' ( ) only);
   *  - it may not be a person's name (that is how "Elohor Olumah" ended up as a type);
   *  - a genuinely new name is created with 0 days/yr (no cap) and every admin is
   *    told, so they can set an allowance, rename it, or delete it afterwards.
   */
  private async resolveLeaveType(schoolId: string, dto: CreateLeaveRequestDto) {
    if (dto.leaveTypeId) {
      const existing = await this.prisma.leaveType.findFirst({ where: { id: dto.leaveTypeId, schoolId } });
      if (!existing) throw new NotFoundException('Leave type not found');
      return existing;
    }

    const name = dto.leaveTypeName?.trim().replace(/\s+/g, ' ');
    if (!name) throw new BadRequestException('Choose a leave type or type one in');
    if (!/^[\p{L}\p{N}][\p{L}\p{N} \-&/'()]*$/u.test(name)) {
      throw new BadRequestException("Leave type may only contain letters, numbers, spaces and - & / ' ( )");
    }

    const match = await this.prisma.leaveType.findFirst({ where: { schoolId, name: { equals: name, mode: 'insensitive' } } });
    if (match) return match;

    const isPersonName = await this.prisma.user.findFirst({ where: { schoolId, fullName: { equals: name, mode: 'insensitive' } }, select: { id: true } });
    if (isPersonName) throw new BadRequestException('That looks like a person\'s name, not a type of leave (e.g. Sick Leave, Study Leave)');

    const typeCount = await this.prisma.leaveType.count({ where: { schoolId } });
    if (typeCount >= MAX_LEAVE_TYPES) throw new BadRequestException('This school already has the maximum number of leave types — pick one from the list');

    const created = await this.prisma.leaveType.create({ data: { schoolId, name, defaultDaysPerYear: 0 } });
    const admins = await this.prisma.user.findMany({ where: { schoolId, role: Role.SCHOOL_ADMIN }, select: { id: true } });
    await this.notifications.notifyUsers(
      admins.map((a) => a.id),
      'New leave type added by staff',
      `"${created.name}" was added with no yearly limit. Set its allowance, rename it or delete it on the Leave page.`,
      '/admin/staff/leave',
    );
    return created;
  }

  async requestLeave(schoolId: string, staffProfileId: string, requesterUserId: string, dto: CreateLeaveRequestDto) {
    const requester = await this.prisma.user.findUnique({ where: { id: requesterUserId }, select: { role: true } });
    // An admin's own request needs ANOTHER admin to approve it — refuse up front rather than leave it stuck forever.
    if (requester?.role === Role.SCHOOL_ADMIN && (await this.otherAdmins(schoolId, requesterUserId)).length === 0) {
      throw new ConflictException('Your leave must be approved by another school admin, and this school has only one. Add a second admin first (Admin dashboard → Staff → "Invite as admin"), then submit again.');
    }

    const leaveType = await this.resolveLeaveType(schoolId, dto);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) throw new BadRequestException('End date cannot be before start date');
    const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

    // No double-booking: a new request may not overlap one that is pending or approved.
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        staffProfileId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
    if (overlap) throw new ConflictException('You already have a pending or approved leave request covering some of these dates');

    // Balance check — only for types with a yearly allowance (0 = uncapped, e.g. Unpaid Leave).
    // Pending requests count against the balance so someone can't queue up more than they have.
    if (leaveType.defaultDaysPerYear > 0) {
      const year = startDate.getUTCFullYear();
      const balance = await this.prisma.$transaction((tx: Prisma.TransactionClient) => this.getOrCreateBalance(tx, staffProfileId, leaveType.id, schoolId, year));
      const pending = await this.prisma.leaveRequest.aggregate({
        _sum: { daysCount: true },
        where: { staffProfileId, leaveTypeId: leaveType.id, status: LeaveStatus.PENDING, startDate: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) } },
      });
      const remaining = balance.daysAllotted - balance.daysUsed - (pending._sum.daysCount ?? 0);
      if (daysCount > remaining) {
        throw new BadRequestException(`You only have ${Math.max(remaining, 0)} day(s) of ${leaveType.name} left; this request is for ${daysCount}.`);
      }
    }

    const request = await this.prisma.leaveRequest.create({
      data: { schoolId, staffProfileId, leaveTypeId: leaveType.id, startDate, endDate, daysCount, reason: dto.reason?.trim() || undefined },
      include: { staffProfile: { include: { user: { select: { fullName: true } } } } },
    });

    // Tell every admin except the requester (an admin never reviews their own request).
    const admins = await this.otherAdmins(schoolId, requesterUserId);
    await this.notifications.notifyUsers(
      admins.map((a) => a.id),
      'New leave request',
      `${request.staffProfile.user.fullName} requested ${daysCount} day(s) of ${leaveType.name}.`,
      '/admin/staff/leave',
    );

    return request;
  }

  listRequests(schoolId: string, status?: LeaveStatus) {
    return this.prisma.leaveRequest.findMany({
      where: { schoolId, ...(status ? { status } : {}) },
      include: { leaveType: true, staffProfile: { include: { user: { select: { fullName: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  myRequests(schoolId: string, staffProfileId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { schoolId, staffProfileId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewRequest(schoolId: string, requestId: string, approve: boolean, reviewerId: string, reviewNote: string | undefined) {
    const request = await this.prisma.leaveRequest.findFirst({ where: { id: requestId, schoolId }, include: { leaveType: true, staffProfile: { select: { userId: true } } } });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING) {
      throw new ConflictException('This request has already been reviewed');
    }
    if (request.staffProfile.userId === reviewerId) {
      throw new ForbiddenException('You cannot approve or decline your own leave — another school admin must review it');
    }

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (approve) {
        const year = request.startDate.getUTCFullYear();
        const balance = await this.getOrCreateBalance(tx, request.staffProfileId, request.leaveTypeId, schoolId, year);
        await tx.staffLeaveBalance.update({ where: { id: balance.id }, data: { daysUsed: balance.daysUsed + request.daysCount } });
      }
      return tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          reviewNote,
        },
        include: { staffProfile: true },
      });
    });

    await this.notifications.notifyUsers(
      [updated.staffProfile.userId],
      approve ? 'Leave request approved' : 'Leave request declined',
      `Your ${request.leaveType.name} request (${request.daysCount} day(s)) was ${approve ? 'approved' : 'declined'}.`,
      '/staff/leave',
    );

    await this.audit.log({
      schoolId,
      actorId: reviewerId,
      action: approve ? 'leave_request.approved' : 'leave_request.rejected',
      entityType: 'LeaveRequest',
      entityId: requestId,
      metadata: { reviewNote },
    });

    return updated;
  }

  async cancelRequest(schoolId: string, requestId: string, caller: { id: string; role: Role }, callerStaffProfileId?: string) {
    const request = await this.prisma.leaveRequest.findFirst({ where: { id: requestId, schoolId } });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING) {
      throw new ConflictException('Only a pending request can be cancelled');
    }
    if (caller.role === Role.STAFF && request.staffProfileId !== callerStaffProfileId) {
      throw new ForbiddenException('You may only cancel your own leave request');
    }
    return this.prisma.leaveRequest.update({ where: { id: requestId }, data: { status: LeaveStatus.CANCELLED } });
  }
}
