// backend/src/modules/platform-finance/platform-finance.service.ts
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { decimalPlacesFor } from '../../common/utils/currency.util';
import { PLATFORM_DEFAULT_CURRENCY } from '../../common/constants';

@Injectable()
export class PlatformFinanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Revenue now comes from schools in multiple currencies, so a single
   * blended "totalKobo" number would be meaningless (₦ + GH₵ + KES
   * summed together is not a real quantity). Everything below is
   * reported PER CURRENCY instead — the frontend renders one card/row
   * per currency rather than one grand total. WalletLedgerEntry.currency
   * (stamped at creation time — see WalletService) makes this a plain
   * groupBy, no join needed.
   */
  async getOverview() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenueByCurrency, totalSchools, activeSchools, suspendedSchools, pendingTransfers, expensesByCurrency] = await Promise.all([
      this.prisma.walletLedgerEntry.groupBy({
        by: ['currency'],
        where: { type: 'CREDIT', status: 'CONFIRMED', createdAt: { gte: monthStart } },
        _sum: { amountKobo: true },
      }),
      this.prisma.school.count(),
      this.prisma.school.count({ where: { status: 'ACTIVE' } }),
      this.prisma.school.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.walletLedgerEntry.count({ where: { source: 'MANUAL_TRANSFER', status: 'PENDING' } }),
      this.prisma.platformExpense.groupBy({
        by: ['currency'],
        where: { incurredAt: { gte: monthStart } },
        _sum: { amountKobo: true },
      }),
    ]);

    const revenueThisMonthByCurrency: Record<string, number> = {};
    for (const row of revenueByCurrency) revenueThisMonthByCurrency[row.currency] = row._sum.amountKobo ?? 0;

    const expensesThisMonthByCurrency: Record<string, number> = {};
    for (const row of expensesByCurrency) expensesThisMonthByCurrency[row.currency] = row._sum.amountKobo ?? 0;

    const allCurrencies = new Set([...Object.keys(revenueThisMonthByCurrency), ...Object.keys(expensesThisMonthByCurrency)]);
    const netThisMonthByCurrency: Record<string, number> = {};
    for (const currency of allCurrencies) {
      netThisMonthByCurrency[currency] = (revenueThisMonthByCurrency[currency] ?? 0) - (expensesThisMonthByCurrency[currency] ?? 0);
    }

    return {
      revenueThisMonthByCurrency,
      expensesThisMonthByCurrency,
      netThisMonthByCurrency,
      totalSchools,
      activeSchools,
      suspendedSchools,
      pendingTransfers,
    };
  }

  /** Defaults to the platform's own operating currency (PLATFORM_DEFAULT_CURRENCY, override via DEFAULT_CURRENCY env) — pass an explicit `currency` if this particular expense (e.g. a vendor invoice) was paid in something else. */
  recordExpense(
    data: { category: string; description: string; amountKobo: number; incurredAt: string; currency?: string },
    recordedById: string,
  ) {
    return this.prisma.platformExpense.create({
      data: {
        category: data.category,
        description: data.description,
        amountKobo: data.amountKobo,
        currency: data.currency ?? PLATFORM_DEFAULT_CURRENCY,
        incurredAt: new Date(data.incurredAt),
        recordedById,
      },
    });
  }

  listExpenses(from?: string, to?: string) {
    return this.prisma.platformExpense.findMany({
      where: from || to ? { incurredAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {},
      orderBy: { incurredAt: 'desc' },
    });
  }

  /** Expenses can span more than one currency (e.g. hosting paid in USD, local salaries in NGN) — one sheet with a Currency column, and one subtotal row per currency rather than a single misleading grand total. */
  async exportExpensesXlsx(from?: string, to?: string): Promise<Buffer> {
    const expenses = await this.listExpenses(from, to);

    const rows = expenses.map((e) => ({
      Date: e.incurredAt.toISOString().slice(0, 10),
      Category: e.category,
      Description: e.description,
      Currency: e.currency,
      Amount: e.amountKobo / 10 ** decimalPlacesFor(e.currency),
    }));

    const totalsByCurrency: Record<string, number> = {};
    for (const e of expenses) {
      const major = e.amountKobo / 10 ** decimalPlacesFor(e.currency);
      totalsByCurrency[e.currency] = (totalsByCurrency[e.currency] ?? 0) + major;
    }
    const totalRows = Object.entries(totalsByCurrency).map(([currency, total]) => ({
      Date: '',
      Category: '',
      Description: `TOTAL (${currency})`,
      Currency: currency,
      Amount: total,
    }));

    const worksheet = XLSX.utils.json_to_sheet([...rows, ...totalRows]);
    worksheet['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 40 }, { wch: 10 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Platform Expenses');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}