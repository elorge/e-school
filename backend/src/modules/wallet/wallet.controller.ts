// backend/src/modules/wallet/wallet.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { SchoolsService } from '../schools/schools.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly schoolsService: SchoolsService,
  ) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Get('pricing')
  async getPricing(@Req() request: Request) {
    const pricePerStudentKobo = await this.schoolsService.getEffectivePricePerStudentKobo(request.schoolId!);
    return { pricePerStudentKobo };
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('balance')
  async getBalance(@Req() request: Request) {
    const balanceKobo = await this.walletService.getBalanceKobo(request.schoolId!);
    return { balanceKobo };
  }

  /**
   * Balance expressed in "how many PIN batches can I afford right now" —
   * useful for the dashboard's "you can generate PINs for N students"
   * message. Uses the school's effective price (override, or platform
   * default) unless the caller passes their own pricePerStudentKobo.
   */
  @Roles(Role.SCHOOL_ADMIN)
  @Get('balance/student-units')
  async getBalanceInStudentUnits(@Req() request: Request, @Query('pricePerStudentKobo') pricePerStudentKobo?: string) {
    const price = pricePerStudentKobo
      ? Number(pricePerStudentKobo)
      : await this.schoolsService.getEffectivePricePerStudentKobo(request.schoolId!);
    return this.walletService.getBalanceInStudentUnits(request.schoolId!, price);
  }
}