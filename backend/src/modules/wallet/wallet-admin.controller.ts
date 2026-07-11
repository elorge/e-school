// backend/src/modules/wallet/wallet-admin.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

/** Platform-wide, no :school in the path — this is Elorge staff working across every school's wallet, not a tenant view. */
@UseGuards(RolesGuard)
@Controller('platform/wallet')
export class WalletAdminController {
  constructor(private readonly walletService: WalletService) {}

  @Roles(Role.FINANCE_OPS, Role.SUPER_ADMIN)
  @Get('manual-transfers/pending')
  listPending() {
    return this.walletService.listPendingManualTransfers();
  }

  @Roles(Role.FINANCE_OPS, Role.SUPER_ADMIN)
  @Post('manual-transfers/:id/resolve')
  resolve(@Param('id') id: string, @Body() body: { approve: boolean }, @CurrentUser() user: AuthenticatedUser) {
    return this.walletService.resolveManualTransferClaim(id, user.id, body.approve);
  }
}