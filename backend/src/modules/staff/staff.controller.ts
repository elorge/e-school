// backend/src/modules/staff/staff.controller.ts
import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { StaffService } from './staff.service';
import { StaffIdCardsService } from './staff-id-cards.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { EmploymentStatus, IdCardRequestStatus, Role } from '@prisma/client';
import { CreateIdCardRequestDto, ReviewIdCardRequestDto } from './dto/id-card-request.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';
import { UpdateMyStaffProfileDto } from './dto/update-my-staff-profile.dto';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly idCardsService: StaffIdCardsService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── ID card requests — declared before the ':id' routes so "id-card-requests" is never read as a profile id ───

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('id-card-requests/me')
  myIdCardStatus(@Req() req: Request, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.getMyIdCardStatus(req.schoolId!, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('id-card-requests')
  requestIdCard(@Req() req: Request, @Body() dto: CreateIdCardRequestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.requestIdCard(req.schoolId!, user.id, dto.reason);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('id-card-requests/:id/cancel')
  cancelIdCardRequest(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.cancelIdCardRequest(req.schoolId!, user.id, id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('id-card-requests')
  listIdCardRequests(@Req() req: Request, @Query('status') status?: IdCardRequestStatus) {
    return this.staffService.listIdCardRequests(req.schoolId!, status);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('id-card-requests/:id/review')
  reviewIdCardRequest(@Req() req: Request, @Param('id') id: string, @Body() dto: ReviewIdCardRequestDto, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.reviewIdCardRequest(req.schoolId!, id, dto.approve, user.id, dto.reviewNote);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('profiles/unassigned-users')
  listUnprofiledUsers(@Req() req: Request) {
    return this.staffService.listUnprofiledUsers(req.schoolId!);
  }

  /** Excel of every staff member's bank details — declared before 'profiles/:id' so "bank-details.xlsx" isn't read as an id. */
  @Roles(Role.SCHOOL_ADMIN)
  @Get('profiles/bank-details.xlsx')
  async downloadBankDetails(@Req() req: Request, @Res() res: Response) {
    const buffer = await this.staffService.exportBankDetailsXlsx(req.schoolId!);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="staff-bank-details.xlsx"',
    });
    res.send(buffer);
  }

  /** The caller's own profile. Created on first call if missing, so an admin or a newly invited teacher never hits a dead end. */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('profiles/me')
  getMyProfile(@Req() req: Request, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.findByUserId(req.schoolId!, user.id);
  }

  /** Self-service edit of the caller's OWN personal details (never pay / role / status). Declared before 'profiles/:id' so "me" isn't read as an id. */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Patch('profiles/me')
  updateMyProfile(@Req() req: Request, @Body() dto: UpdateMyStaffProfileDto, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.updateMine(req.schoolId!, user.id, dto);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('profiles')
  listAll(@Req() req: Request, @Query('employmentStatus') employmentStatus?: EmploymentStatus) {
    return this.staffService.listAll(req.schoolId!, employmentStatus);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('profiles')
  async createProfile(@Req() req: Request, @Body() dto: CreateStaffProfileDto, @CurrentUser() user: AuthenticatedUser) {
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: req.schoolId! } });
    return this.staffService.createProfile(req.schoolId!, school.code, dto, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('profiles/:id')
  async findOne(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const profile = await this.staffService.findOne(req.schoolId!, id);
    this.assertOwnerOrAdmin(profile, user);
    return profile;
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Patch('profiles/:id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateStaffProfileDto, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.update(req.schoolId!, id, dto, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('profiles/:id/id-card/issue')
  issueIdCard(@Req() req: Request, @Param('id') id: string) {
    return this.staffService.issueIdCard(req.schoolId!, id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('profiles/:id/id-card/pdf')
  async downloadIdCard(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const profile = await this.staffService.findOne(req.schoolId!, id);
    this.assertOwnerOrAdmin(profile, user);
    const pdfBuffer = await this.idCardsService.renderIdCardPdf(req.schoolId!, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="staff-id-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('profiles/:id/attendance')
  async listAttendance(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const profile = await this.staffService.findOne(req.schoolId!, id);
    this.assertOwnerOrAdmin(profile, user);
    return this.staffService.listAttendance(req.schoolId!, id);
  }

  /** Attendance sync — a STAFF caller may only log their own clock-in/out; a SCHOOL_ADMIN may log for anyone (e.g. the gate device). */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('profiles/:id/attendance')
  async logAttendance(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { direction?: 'CLOCK_IN' | 'CLOCK_OUT'; occurredAt: string; clientReferenceId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const profile = await this.staffService.findOne(req.schoolId!, id);
    this.assertOwnerOrAdmin(profile, user);
    return this.staffService.logAttendance(req.schoolId!, id, body.direction ?? 'CLOCK_IN', body.occurredAt, body.clientReferenceId);
  }

  /**
   * Staff may only touch their own record; a SCHOOL_ADMIN (the single HR
   * authority) may touch anyone's. Synchronous — the JWT role is enough, no
   * extra "is HR" lookup exists any more.
   */
  private assertOwnerOrAdmin(profile: { userId: string }, user: AuthenticatedUser) {
    if (user.role === Role.SCHOOL_ADMIN) return;
    if (profile.userId === user.id) return;
    throw new ForbiddenException('You may only access your own staff record');
  }
}
