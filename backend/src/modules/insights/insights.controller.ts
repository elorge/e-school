// backend/src/modules/insights/insights.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { InsightsService } from './insights.service';
import { PinsService } from '../pins/pins.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller(':school')
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly pinsService: PinsService,
  ) {}

  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('students/:studentId/session-wrap')
  getWrap(@Req() req: Request, @Param('studentId') studentId: string, @Query('academicSession') academicSession: string) {
    return this.insightsService.buildSessionWrap(req.schoolId!, studentId, academicSession);
  }

  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('students/:studentId/session-wrap/pdf')
  async getWrapPdf(
    @Req() req: Request,
    @Param('studentId') studentId: string,
    @Query('academicSession') academicSession: string,
    @Res() res: Response,
  ) {
    const buffer = await this.insightsService.renderSessionWrapPdf(req.schoolId!, studentId, academicSession);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="session-wrap.pdf"` });
    res.send(buffer);
  }

/**
   * Public, parent-facing. Whichever term's PIN is currently active
   * determines the session shown — a parent with term 1's PIN sees a
   * one-term wrap, term 2's PIN sees two terms, and so on. No separate
   * "which session do you want" field: the server derives it from the
   * PIN itself, so a parent can't probe for a session they don't hold a
   * PIN for.
   */
  @Public()
  @UseGuards(TenantGuard)
  @Post('session-wrap/lookup')
  async publicLookup(@Req() req: Request, @Body() body: { admissionId: string; pin: string }) {
    const { student, pin } = await this.pinsService.verifyPin(req.schoolId!, body.admissionId, body.pin);
    return this.insightsService.buildSessionWrapForPin(req.schoolId!, student.id, pin.termId);
  }
}