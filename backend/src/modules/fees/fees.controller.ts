// backend/src/modules/fees/fees.controller.ts
import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { FeesService } from './fees.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role, FeeInvoiceStatus } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Post('structures')
  createStructure(@Req() req: Request, @Body() body: { termId: string; classId?: string; name: string; amountKobo: number }) {
    return this.feesService.createFeeStructure(req.schoolId!, body);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('structures')
  listStructures(@Req() req: Request, @Query('termId') termId?: string) {
    return this.feesService.listFeeStructures(req.schoolId!, termId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('invoices/generate')
  generateInvoices(@Req() req: Request, @Body() body: { termId: string; classId?: string }) {
    return this.feesService.generateInvoices(req.schoolId!, body.termId, body.classId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('invoices')
  listInvoices(@Req() req: Request, @Query('termId') termId?: string, @Query('status') status?: FeeInvoiceStatus) {
    return this.feesService.listInvoices(req.schoolId!, termId, status);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('invoices/:studentId/:termId')
  getInvoice(@Req() req: Request, @Param('studentId') studentId: string, @Param('termId') termId: string) {
    return this.feesService.getInvoice(req.schoolId!, studentId, termId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('invoices/:id/payments')
  recordPayment(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { amountKobo: number; method: 'CASH' | 'BANK_TRANSFER' | 'CARD' },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.feesService.recordPayment(req.schoolId!, id, body.amountKobo, body.method, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('invoices/export')
  async exportInvoices(@Req() req: Request, @Query('termId') termId: string | undefined, @Res() res: Response) {
    const buffer = await this.feesService.exportInvoicesXlsx(req.schoolId!, termId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="fee-invoices.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
  
  @Roles(Role.SCHOOL_ADMIN)
  @Get('debtors')
  getDebtors(@Req() req: Request, @Query('termId') termId: string) {
    return this.feesService.getDebtorsSummary(req.schoolId!, termId);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('match-payment')
  matchPayment(@Req() req: Request, @Body() body: { narration: string; amountKobo?: number }) {
    return this.feesService.suggestInvoiceMatches(req.schoolId!, body.narration, body.amountKobo);
  }
}