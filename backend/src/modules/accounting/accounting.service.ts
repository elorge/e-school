// backend/src/modules/accounting/accounting.service.ts
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  recordExpense(
    schoolId: string,
    data: { category: string; description: string; amountKobo: number; incurredAt: string },
    recordedById: string,
  ) {
    return this.prisma.expenseEntry.create({
      data: { schoolId, recordedById, ...data, incurredAt: new Date(data.incurredAt) },
    });
  }

  listExpenses(schoolId: string, from?: string, to?: string) {
    return this.prisma.expenseEntry.findMany({
      where: {
        schoolId,
        ...(from || to ? { incurredAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
      },
      orderBy: { incurredAt: 'desc' },
    });
  }

  async exportXlsx(schoolId: string, from?: string, to?: string): Promise<Buffer> {
    const expenses = await this.listExpenses(schoolId, from, to);
    const payments = await this.prisma.feePayment.findMany({
      where: { schoolId, ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) },
    });

    const workbook = XLSX.utils.book_new();

    const expenseRows = expenses.map((e) => ({
      Date: e.incurredAt.toISOString().slice(0, 10),
      Category: e.category,
      Description: e.description,
      'Amount (₦)': e.amountKobo / 100,
    }));
    const expenseSheet = XLSX.utils.json_to_sheet(expenseRows);
    expenseSheet['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 36 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');

    const incomeRows = payments.map((p) => ({
      Date: p.createdAt.toISOString().slice(0, 10),
      Method: p.method,
      Reference: p.reference,
      'Amount (₦)': p.amountKobo / 100,
    }));
    const incomeSheet = XLSX.utils.json_to_sheet(incomeRows);
    incomeSheet['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income (Fee Payments)');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
  
  async getIncomeExpenditureSummary(schoolId: string, from: string, to: string) {
    const [payments, expenses] = await Promise.all([
      this.prisma.feePayment.findMany({ where: { schoolId, createdAt: { gte: new Date(from), lte: new Date(to) } } }),
      this.prisma.expenseEntry.findMany({ where: { schoolId, incurredAt: { gte: new Date(from), lte: new Date(to) } } }),
    ]);

    const totalIncomeKobo = payments.reduce((sum, p) => sum + p.amountKobo, 0);
    const totalExpenseKobo = expenses.reduce((sum, e) => sum + e.amountKobo, 0);

    const expenseByCategory: Record<string, number> = {};
    for (const e of expenses) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] ?? 0) + e.amountKobo;
    }

    return {
      from,
      to,
      totalIncomeKobo,
      totalExpenseKobo,
      netKobo: totalIncomeKobo - totalExpenseKobo,
      expenseByCategory,
    };
  }
}