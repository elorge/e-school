// backend/src/modules/leave/leave.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LeaveStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeaveRequestDto, CreateLeaveTypeDto } from './dto/leave.dto';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  listTypes(schoolId: string) {
    return this.prisma.leaveType.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
  }

  createType(schoolId: string, dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.create({
      data: { schoolId, name: dto.name, defaultDaysPerYear: dto.defaultDaysPerYear ?? 0 },
    });
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

  async requestLeave(schoolId: string, staffProfileId: string, dto: CreateLeaveRequestDto) {
    const leaveType = await this.prisma.leaveType.findFirst({ where: { id: dto.leaveTypeId, schoolId } });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) throw new BadRequestException('endDate cannot be before startDate');
    const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

    const request = await this.prisma.leaveRequest.create({
      data: { schoolId, staffProfileId, leaveTypeId: dto.leaveTypeId, startDate, endDate, daysCount, reason: dto.reason },
    });

    const admins = await this.prisma.user.findMany({ where: { schoolId, role: Role.SCHOOL_ADMIN }, select: { id: true } });
    await this.notifications.notifyUsers(
      admins.map((a) => a.id),
      'New leave request',
      `A ${leaveType.name} request for ${daysCount} day(s) is awaiting your review.`,
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
    const request = await this.prisma.leaveRequest.findFirst({ where: { id: requestId, schoolId }, include: { leaveType: true } });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING) {
      throw new ConflictException('This request has already been reviewed');
    }

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (approve) {
        const year = request.startDate.getFullYear();
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
