// backend/src/modules/inventory/inventory.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryTransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  createItem(schoolId: string, data: { name: string; category?: string; unit?: string; reorderLevel?: number; unitCostKobo?: number }) {
    return this.prisma.inventoryItem.create({ data: { schoolId, ...data } });
  }

  listItems(schoolId: string) {
    return this.prisma.inventoryItem.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
  }

  listLowStock(schoolId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM inventory_items
      WHERE "schoolId" = ${schoolId} AND "quantityOnHand" <= "reorderLevel"
    `;
  }

  async recordTransaction(
    schoolId: string,
    itemId: string,
    type: InventoryTransactionType,
    quantity: number,
    note: string | undefined,
    recordedById: string,
  ) {
    if (quantity <= 0) throw new BadRequestException('Quantity must be positive');
    const item = await this.prisma.inventoryItem.findFirstOrThrow({ where: { id: itemId, schoolId } });

    const delta = type === 'STOCK_IN' ? quantity : -quantity;
    if (type === 'STOCK_OUT' && item.quantityOnHand + delta < 0) {
      throw new BadRequestException('Cannot remove more than is currently in stock');
    }

    await this.prisma.$transaction([
      this.prisma.inventoryTransaction.create({ data: { schoolId, itemId, type, quantity, note, recordedById } }),
      this.prisma.inventoryItem.update({ where: { id: itemId }, data: { quantityOnHand: { increment: delta } } }),
    ]);

    return this.prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
  }
}