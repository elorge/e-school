// backend/src/modules/payroll/payroll.controller.ts
import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PayrollService } from './payroll.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';
import { GeneratePayrollRunDto } from './dto/generate-payroll-run.dto';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Post('runs')
  generateRun(@Req() req: Request, @Body() dto: GeneratePayrollRunDto, @CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.generateRun(req.schoolId!, dto, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('runs')
  listRuns(@Req() req: Request) {
    return this.payrollService.listRuns(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('runs/:id')
  getRun(@Req() req: Request, @Param('id') id: string) {
    return this.payrollService.getRun(req.schoolId!, id);
  }

  /** Preview before download — surfaces staff missing bank details so the admin can fix those first rather than discovering it as a gap in the CSV. */
  @Roles(Role.SCHOOL_ADMIN)
  @Get('runs/:id/schedule')
  async getSchedule(@Req() req: Request, @Param('id') id: string) {
    const { rows, missingBankDetails } = await this.payrollService.buildDisbursementSchedule(req.schoolId!, id);
    return { rows, missingBankDetails };
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('runs/:id/schedule.csv')
  async downloadSchedule(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const { run, rows } = await this.payrollService.buildDisbursementSchedule(req.schoolId!, id);
    const csv = this.payrollService.toScheduleCsv(rows);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="disbursement-schedule-${run.periodLabel.replace(/\s+/g, '-')}.csv"`,
    });
    res.send(csv);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('runs/:id/approve')
  approveRun(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.approveRun(req.schoolId!, id, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete('runs/:id')
  deleteRun(@Req() req: Request, @Param('id') id: string) {
    return this.payrollService.deleteRun(req.schoolId!, id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('payslips/:id/pay')
  markPaid(@Req() req: Request, @Param('id') id: string, @Body() body: { paymentReference?: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.markPaid(req.schoolId!, id, body.paymentReference, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('payslips/me')
  listMyPayslips(@Req() req: Request, @CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.listMyPayslips(req.schoolId!, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  @Get('payslips/:id/pdf')
  async downloadPayslip(@Req() req: Request, @Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const payslip = await this.payrollService.getPayslip(req.schoolId!, id);
    if (user.role === Role.STAFF && payslip.userId !== user.id) {
      throw new ForbiddenException('You may only view your own payslip');
    }
    const pdfBuffer = await this.payrollService.renderPayslipPdf(req.schoolId!, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="payslip-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
