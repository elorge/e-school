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
import { EmploymentStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffProfileDto } from './dto/create-staff-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly idCardsService: StaffIdCardsService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Get('profiles/unassigned-users')
  listUnprofiledUsers(@Req() req: Request) {
    return this.staffService.listUnprofiledUsers(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('profiles/me')
  getMyProfile(@Req() req: Request, @CurrentUser() user: AuthenticatedUser) {
    return this.staffService.findByUserId(req.schoolId!, user.id);
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

  /** Gate-scan sync endpoint — any signed-in staff device can log a scan (mirrors IdCardsController's student attendance route). */
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Post('profiles/:id/attendance')
  logAttendance(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { direction?: 'CLOCK_IN' | 'CLOCK_OUT'; occurredAt: string; clientReferenceId: string },
  ) {
    return this.staffService.logAttendance(req.schoolId!, id, body.direction ?? 'CLOCK_IN', body.occurredAt, body.clientReferenceId);
  }

  /** A STAFF caller may only ever read their own profile/card/attendance — SCHOOL_ADMIN can read anyone's. */
  private assertOwnerOrAdmin(profile: { userId: string }, user: AuthenticatedUser) {
    if (user.role === Role.STAFF && profile.userId !== user.id) {
      throw new ForbiddenException('You may only view your own staff record');
    }
  }
}
