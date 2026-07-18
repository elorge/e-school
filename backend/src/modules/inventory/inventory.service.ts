// backend/src/modules/inventory/inventory.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
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

  listTransactions(schoolId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { schoolId },
      include: { item: { select: { name: true, unit: true } }, recordedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async exportXlsx(schoolId: string): Promise<Buffer> {
    const items = await this.prisma.inventoryItem.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { schoolId },
      include: { item: { select: { name: true } }, recordedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const itemRows = items.map((i) => ({
      Item: i.name,
      Category: i.category ?? '—',
      'Qty on hand': i.quantityOnHand,
      Unit: i.unit,
      'Reorder level': i.reorderLevel,
      'Unit cost (₦)': i.unitCostKobo / 100,
    }));
    const txRows = transactions.map((t) => ({
      Date: t.createdAt.toISOString().slice(0, 10),
      Item: t.item.name,
      Type: t.type,
      Quantity: t.quantity,
      'Recorded by': t.recordedBy.fullName,
      Note: t.note ?? '',
    }));

    const workbook = XLSX.utils.book_new();
    const itemSheet = XLSX.utils.json_to_sheet(itemRows);
    itemSheet['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, itemSheet, 'Current Stock');

    const txSheet = XLSX.utils.json_to_sheet(txRows);
    txSheet['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(workbook, txSheet, 'Transaction Log');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
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