// backend/src/modules/platform-finance/platform-finance.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformFinanceService } from './platform-finance.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

@UseGuards(RolesGuard)
@Controller('platform/finance')
export class PlatformFinanceController {
  constructor(private readonly platformFinanceService: PlatformFinanceService) {}

  @Roles(Role.FINANCE_OPS, Role.SUPER_ADMIN)
  @Get('overview')
  getOverview() {
    return this.platformFinanceService.getOverview();
  }

  @Roles(Role.FINANCE_OPS, Role.SUPER_ADMIN)
  @Post('expenses')
  recordExpense(
    @Body() body: { category: string; description: string; amountKobo: number; incurredAt: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.platformFinanceService.recordExpense(body, user.id);
  }

  @Roles(Role.FINANCE_OPS, Role.SUPER_ADMIN)
  @Get('expenses')
  listExpenses(@Query('from') from?: string, @Query('to') to?: string) {
    return this.platformFinanceService.listExpenses(from, to);
  }
}