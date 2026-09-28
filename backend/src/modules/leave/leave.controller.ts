// backend/src/modules/leave/leave.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LeaveService } from './leave.service';
import { StaffService } from '../staff/staff.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AllowHr } from '../../common/decorators/allow-hr.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { LeaveStatus, Role } from '@prisma/client';
import { CreateLeaveRequestDto, CreateLeaveTypeDto, ReviewLeaveRequestDto } from './dto/leave.dto';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly staffService: StaffService,
  ) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('types')
  listTypes(@Req() req: Request) {
    return this.leaveService.listTypes(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @AllowHr()
  @Post('types')
  createType(@Req() req: Request, @Body() dto: CreateLeaveTypeDto) {
    return this.leaveService.createType(req.schoolId!, dto);
  }

  /** One-click backfill for a school that has no leave types yet (e.g. one seeded/created before defaults existed). Safe to call repeatedly — see LeaveService.seedDefaultTypes. */
  @Roles(Role.SCHOOL_ADMIN)
  @AllowHr()
  @Post('types/seed-defaults')
  seedDefaultTypes(@Req() req: Request) {
    return this.leaveService.seedDefaultTypes(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('balances/me')
  async myBalances(@Req() req: Request, @CurrentUser() user: AuthenticatedUser, @Query('year') year?: string) {
    const profile = await this.staffService.findByUserId(req.schoolId!, user.id);
    return this.leaveService.myBalances(req.schoolId!, profile.id, year ? Number(year) : new Date().getFullYear());
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('requests')
  async requestLeave(@Req() req: Request, @Body() dto: CreateLeaveRequestDto, @CurrentUser() user: AuthenticatedUser) {
    const profile = await this.staffService.findByUserId(req.schoolId!, user.id);
    return this.leaveService.requestLeave(req.schoolId!, profile.id, dto);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('requests/me')
  async myRequests(@Req() req: Request, @CurrentUser() user: AuthenticatedUser) {
    const profile = await this.staffService.findByUserId(req.schoolId!, user.id);
    return this.leaveService.myRequests(req.schoolId!, profile.id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @AllowHr()
  @Get('requests')
  listRequests(@Req() req: Request, @Query('status') status?: LeaveStatus) {
    return this.leaveService.listRequests(req.schoolId!, status);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @AllowHr()
  @Post('requests/:id/review')
  reviewRequest(@Req() req: Request, @Param('id') id: string, @Body() dto: ReviewLeaveRequestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.reviewRequest(req.schoolId!, id, dto.approve, user.id, dto.reviewNote);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('requests/:id/cancel')
  async cancelRequest(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const profile = user.role === Role.STAFF ? await this.staffService.findByUserId(req.schoolId!, user.id) : undefined;
    return this.leaveService.cancelRequest(req.schoolId!, id, user, profile?.id);
  }
}
