// backend/src/modules/reports/reports.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { PinsService } from '../pins/pins.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/students/:studentId/results/:termId')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pinsService: PinsService,
  ) {}

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('pdf')
  async downloadReportPdf(
    @Req() request: Request,
    @Param('studentId') studentId: string,
    @Param('termId') termId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.renderReportPdf(request.schoolId!, studentId, termId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="report-${studentId}-${termId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  /**
   * Public, PIN-gated version — a parent holding a valid Admission ID +
   * PIN for THIS student can download the exact same PDF a staff member
   * sees. Re-verifies the PIN server-side on every call (not just once
   * at lookup time) — the PDF is a heavier operation than a JSON
   * lookup, so it goes through the same lockout protection, not a
   * lighter/separate check.
   */
  @Public()
  @UseGuards(TenantGuard)
  @Get('pdf/public')
  async downloadReportPdfPublic(
    @Req() request: Request,
    @Param('studentId') studentId: string,
    @Param('termId') termId: string,
    @Query('admissionId') admissionId: string,
    @Query('pin') pin: string,
    @Res() res: Response,
  ) {
    const { student } = await this.pinsService.verifyPin(request.schoolId!, admissionId, pin);
    if (student.id !== studentId) {
      // Same generic failure as a wrong PIN — never reveal that the PIN
      // was valid for a DIFFERENT student, which would let someone
      // fish for valid Admission IDs.
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const pdfBuffer = await this.reportsService.renderReportPdf(request.schoolId!, studentId, termId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="report-${studentId}-${termId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}