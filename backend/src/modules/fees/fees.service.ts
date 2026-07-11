// backend/src/modules/fees/fees.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeeInvoiceStatus } from '@prisma/client';

@Injectable()
export class FeesService {
  constructor(private readonly prisma: PrismaService) {}

  createFeeStructure(schoolId: string, data: { termId: string; classId?: string; name: string; amountKobo: number }) {
    return this.prisma.feeStructure.create({ data: { schoolId, ...data } });
  }

  listFeeStructures(schoolId: string, termId?: string) {
    return this.prisma.feeStructure.findMany({ where: { schoolId, ...(termId ? { termId } : {}) } });
  }

  /**
   * Generates one invoice per student in scope (all fee structures for
   * their class + school-wide ones, summed). Idempotent per
   * (studentId, termId) via the schema's unique constraint — re-running
   * this after adding a new fee structure will error on existing
   * invoices rather than silently double-invoice; regenerate only for
   * newly admitted students instead.
   */
  async generateInvoices(schoolId: string, termId: string, classId?: string) {
    const students = await this.prisma.student.findMany({
      where: { schoolId, status: 'ACTIVE', ...(classId ? { classId } : {}) },
    });
    const structures = await this.prisma.feeStructure.findMany({ where: { schoolId, termId } });

    const created = [];
    for (const student of students) {
      const applicable = structures.filter((s) => !s.classId || s.classId === student.classId);
      const totalKobo = applicable.reduce((sum, s) => sum + s.amountKobo, 0);
      if (totalKobo === 0) continue;

      const existing = await this.prisma.feeInvoice.findUnique({
        where: { schoolId_studentId_termId: { schoolId, studentId: student.id, termId } },
      });
      if (existing) continue;

      const invoice = await this.prisma.feeInvoice.create({ data: { schoolId, studentId: student.id, termId, totalKobo } });
      created.push(invoice);
    }
    return { created: created.length };
  }

  getInvoice(schoolId: string, studentId: string, termId: string) {
    return this.prisma.feeInvoice.findUnique({
      where: { schoolId_studentId_termId: { schoolId, studentId, termId } },
      include: { payments: true },
    });
  }

  listInvoices(schoolId: string, termId?: string, status?: FeeInvoiceStatus) {
    return this.prisma.feeInvoice.findMany({
      where: { schoolId, ...(termId ? { termId } : {}), ...(status ? { status } : {}) },
      include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Manual recording — cash or bank transfer confirmed by staff. Card payments would reuse PaymentsService the same way wallet funding does; not wired yet, see note in response. */
  async recordPayment(
    schoolId: string,
    invoiceId: string,
    amountKobo: number,
    method: 'CASH' | 'BANK_TRANSFER' | 'CARD',
    recordedById: string,
  ) {
    const invoice = await this.prisma.feeInvoice.findFirst({ where: { id: invoiceId, schoolId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (amountKobo <= 0) throw new BadRequestException('Amount must be positive');

    const reference = `fee-${invoiceId}-${Date.now()}`;
    await this.prisma.feePayment.create({ data: { schoolId, invoiceId, amountKobo, method, reference, recordedById } });

    const newPaidKobo = invoice.paidKobo + amountKobo;
    const status: FeeInvoiceStatus = newPaidKobo >= invoice.totalKobo ? 'PAID' : newPaidKobo > 0 ? 'PARTIALLY_PAID' : 'UNPAID';

    return this.prisma.feeInvoice.update({ where: { id: invoiceId }, data: { paidKobo: newPaidKobo, status } });
  }

  async getDebtorsSummary(schoolId: string, termId: string) {
    const invoices = await this.prisma.feeInvoice.findMany({
      where: { schoolId, termId, status: { not: 'PAID' } },
      include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
    });
    return invoices.map((inv) => ({
      student: inv.student,
      totalKobo: inv.totalKobo,
      paidKobo: inv.paidKobo,
      outstandingKobo: inv.totalKobo - inv.paidKobo,
    }));
  }
}