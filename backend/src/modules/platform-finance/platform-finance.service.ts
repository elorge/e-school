// backend/src/modules/platform-finance/platform-finance.service.ts
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformFinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenueThisMonth, totalSchools, activeSchools, suspendedSchools, pendingTransfers, expensesThisMonth] = await Promise.all([
      this.prisma.walletLedgerEntry.aggregate({
        where: { type: 'CREDIT', status: 'CONFIRMED', createdAt: { gte: monthStart } },
        _sum: { amountKobo: true },
      }),
      this.prisma.school.count(),
      this.prisma.school.count({ where: { status: 'ACTIVE' } }),
      this.prisma.school.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.walletLedgerEntry.count({ where: { source: 'MANUAL_TRANSFER', status: 'PENDING' } }),
      this.prisma.platformExpense.aggregate({ where: { incurredAt: { gte: monthStart } }, _sum: { amountKobo: true } }),
    ]);

    const revenueKobo = revenueThisMonth._sum.amountKobo ?? 0;
    const expensesKobo = expensesThisMonth._sum.amountKobo ?? 0;

    return {
      revenueThisMonthKobo: revenueKobo,
      expensesThisMonthKobo: expensesKobo,
      netThisMonthKobo: revenueKobo - expensesKobo,
      totalSchools,
      activeSchools,
      suspendedSchools,
      pendingTransfers,
    };
  }

  recordExpense(data: { category: string; description: string; amountKobo: number; incurredAt: string }, recordedById: string) {
    return this.prisma.platformExpense.create({ data: { ...data, incurredAt: new Date(data.incurredAt), recordedById } });
  }

  listExpenses(from?: string, to?: string) {
    return this.prisma.platformExpense.findMany({
      where: from || to ? { incurredAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {},
      orderBy: { incurredAt: 'desc' },
    });
  }

  async exportExpensesXlsx(from?: string, to?: string): Promise<Buffer> {
    const expenses = await this.listExpenses(from, to);
    const rows = expenses.map((e) => ({
      Date: e.incurredAt.toISOString().slice(0, 10),
      Category: e.category,
      Description: e.description,
      'Amount (₦)': e.amountKobo / 100,
    }));
    const totalRow = { Date: '', Category: '', Description: 'TOTAL', 'Amount (₦)': rows.reduce((s, r) => s + r['Amount (₦)'], 0) };

    const worksheet = XLSX.utils.json_to_sheet([...rows, totalRow]);
    worksheet['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 40 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Platform Expenses');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}