// backend/src/modules/accounting/accounting.controller.ts
import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccountingService } from './accounting.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Post('expenses')
  recordExpense(
    @Req() req: Request,
    @Body() body: { category: string; description: string; amountKobo: number; incurredAt: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accountingService.recordExpense(req.schoolId!, body, user.id);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('expenses')
  listExpenses(@Req() req: Request, @Query('from') from?: string, @Query('to') to?: string) {
    return this.accountingService.listExpenses(req.schoolId!, from, to);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('summary')
  getSummary(@Req() req: Request, @Query('from') from: string, @Query('to') to: string) {
    return this.accountingService.getIncomeExpenditureSummary(req.schoolId!, from, to);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('export')
  async exportAccounting(@Req() req: Request, @Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const buffer = await this.accountingService.exportXlsx(req.schoolId!, from, to);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="accounting.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}