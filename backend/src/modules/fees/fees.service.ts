// backend/src/modules/fees/fees.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { FeeInvoiceStatus } from '@prisma/client';
import { decimalPlacesFor } from '../../common/utils/currency.util';

@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

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

    const updated = await this.prisma.feeInvoice.update({ where: { id: invoiceId }, data: { paidKobo: newPaidKobo, status } });
    await this.audit.log({
      schoolId,
      actorId: recordedById,
      action: 'fee_payment.recorded',
      entityType: 'FeeInvoice',
      entityId: invoiceId,
      metadata: { amountKobo, method },
    });
    return updated;
  }

  /** All rows share one school's currency (an export is always scoped to one schoolId), so fetch it once and use it for both the divisor and the column labels — never a blind /100. */
  async exportInvoicesXlsx(schoolId: string, termId?: string): Promise<Buffer> {
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId }, select: { currency: true } });
    const divisor = 10 ** decimalPlacesFor(school.currency);
    const label = (name: string) => `${name} (${school.currency})`;

    const invoices = await this.prisma.feeInvoice.findMany({
      where: { schoolId, ...(termId ? { termId } : {}) },
      include: { student: { select: { firstName: true, lastName: true, studentId: true } }, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = invoices.map((inv) => ({
      Student: `${inv.student.firstName} ${inv.student.lastName}`,
      'Admission ID': inv.student.studentId ?? '—',
      [label('Total')]: inv.totalKobo / divisor,
      [label('Paid')]: inv.paidKobo / divisor,
      [label('Outstanding')]: (inv.totalKobo - inv.paidKobo) / divisor,
      Status: inv.status,
      Payments: inv.payments.length,
    }));

    // Computed from the raw `invoices` (not the already-mapped `rows`) for
    // two reasons: (1) `rows` is a mixed string/number object, so indexing
    // it dynamically loses numeric typing; (2) summing raw kobo integers
    // first and dividing once at the end avoids compounding rounding from
    // per-row division.
    const totalRow = {
      Student: 'TOTAL',
      'Admission ID': '',
      [label('Total')]: invoices.reduce((s, inv) => s + inv.totalKobo, 0) / divisor,
      [label('Paid')]: invoices.reduce((s, inv) => s + inv.paidKobo, 0) / divisor,
      [label('Outstanding')]: invoices.reduce((s, inv) => s + (inv.totalKobo - inv.paidKobo), 0) / divisor,
      Status: '',
      Payments: '',
    };

    const worksheet = XLSX.utils.json_to_sheet([...rows, totalRow]);
    worksheet['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 10 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Invoices');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
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

  /**
   * Suggests which unpaid invoice a raw bank-alert narration likely
   * matches — deterministic scoring (name similarity + amount
   * equality), not machine learning. Explainable and free to run;
   * genuinely smarter matching (fuzzy handling of nicknames, typos)
   * would need a real ML model and ongoing cost, which isn't
   * proportionate for this problem size.
   */
  async suggestInvoiceMatches(schoolId: string, narration: string, amountKobo?: number) {
    const unpaid = await this.prisma.feeInvoice.findMany({
      where: { schoolId, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      include: { student: true },
    });

    const narrationLower = narration.toLowerCase();
    const scored = unpaid.map((inv) => {
      let score = 0;
      const fullName = `${inv.student.firstName} ${inv.student.lastName}`.toLowerCase();
      const nameParts = fullName.split(' ');
      for (const part of nameParts) {
        if (part.length > 2 && narrationLower.includes(part)) score += 40;
      }
      const outstanding = inv.totalKobo - inv.paidKobo;
      if (amountKobo && Math.abs(outstanding - amountKobo) < 100) score += 50; // exact-ish amount match
      return { invoice: inv, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => ({
        invoiceId: s.invoice.id,
        studentName: `${s.invoice.student.firstName} ${s.invoice.student.lastName}`,
        admissionId: s.invoice.student.studentId,
        outstandingKobo: s.invoice.totalKobo - s.invoice.paidKobo,
        confidence: s.score,
      }));
  }
}