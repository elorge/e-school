// backend/src/modules/reports/reports.controller.ts
import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

// Deliberately nested under the same path shape as ResultsController
// (:school/students/:studentId/results/:termId) with one extra segment
// (/pdf) — no route collision since Nest matches on the full path.
@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/students/:studentId/results/:termId')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
}