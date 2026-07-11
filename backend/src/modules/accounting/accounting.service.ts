// backend/src/modules/accounting/accounting.service.ts
import { Injectable } from '@nestjs/common';
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

  /**
   * Income & Expenditure summary — income = confirmed fee payments in
   * range (the real cash a school collected), expenditure = recorded
   * expenses in range. Deliberately does NOT include the platform
   * wallet (that's what the school pays ELORGE, a cost of using this
   * software, not the school's own income/expense books).
   */
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