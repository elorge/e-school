// backend/src/modules/inventory/inventory.controller.ts
import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role, InventoryTransactionType } from '@prisma/client';

@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Get('items')
  listItems(@Req() req: Request) {
    return this.inventoryService.listItems(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('items/low-stock')
  listLowStock(@Req() req: Request) {
    return this.inventoryService.listLowStock(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('transactions')
  listTransactions(@Req() req: Request) {
    return this.inventoryService.listTransactions(req.schoolId!);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Get('export')
  async exportInventory(@Req() req: Request, @Res() res: Response) {
    const buffer = await this.inventoryService.exportXlsx(req.schoolId!);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="inventory.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('items')
  createItem(
    @Req() req: Request,
    @Body() body: { name: string; category?: string; unit?: string; reorderLevel?: number; unitCostKobo?: number },
  ) {
    return this.inventoryService.createItem(req.schoolId!, body);
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('items/:id/transactions')
  recordTransaction(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { type: InventoryTransactionType; quantity: number; note?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.recordTransaction(req.schoolId!, id, body.type, body.quantity, body.note, user.id);
  }
}