// backend/src/modules/payroll/payroll.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { EmploymentStatus, PayrollRunStatus, PayslipStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GeneratePayrollRunDto } from './dto/generate-payroll-run.dto';
import { formatMoney, minorToMajor } from '../../common/utils/currency.util';
import { SalaryLineItem } from '../staff/dto/create-staff-profile.dto';

function sumLineItems(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum: number, item) => sum + (Number((item as SalaryLineItem)?.amountKobo) || 0), 0);
}

const RUN_INCLUDE = {
  payslips: {
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      staffProfile: {
        select: { staffId: true, department: true, designation: true, bankName: true, bankAccountName: true, bankAccountNumber: true },
      },
    },
  },
} satisfies Prisma.PayrollRunInclude;

/** One line of the CSV a school hands to their own bank's bulk-transfer upload — see PayrollService.buildDisbursementSchedule. */
export interface DisbursementScheduleRow {
  payslipId: string;
  staffId: string;
  fullName: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  amountMajor: number;
  currency: string;
  narration: string;
}

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Snapshots every ACTIVE staff member's current salary structure into
   * a Payslip for this run. Deliberately only ACTIVE staff — someone
   * SUSPENDED/TERMINATED/ON_LEAVE mid-period is a manual decision for
   * the admin to handle (add them back in, or adjust manually), not
   * something payroll should silently guess at.
   */
  async generateRun(schoolId: string, dto: GeneratePayrollRunDto, createdById: string) {
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
    const staff = await this.prisma.staffProfile.findMany({
      where: { schoolId, employmentStatus: EmploymentStatus.ACTIVE },
    });
    if (staff.length === 0) {
      throw new BadRequestException('No active staff members to generate payroll for');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const run = await tx.payrollRun.create({
        data: {
          schoolId,
          periodLabel: dto.periodLabel,
          periodStart: new Date(dto.periodStart),
          periodEnd: new Date(dto.periodEnd),
          createdById,
        },
      });

      let totalGrossKobo = 0;
      let totalDeductionsKobo = 0;
      let totalNetKobo = 0;

      for (const profile of staff) {
        const allowancesKobo = sumLineItems(profile.allowances);
        const deductionsKobo = sumLineItems(profile.deductions);
        const grossKobo = profile.baseSalaryKobo + allowancesKobo;
        const netKobo = grossKobo - deductionsKobo;

        await tx.payslip.create({
          data: {
            schoolId,
            payrollRunId: run.id,
            staffProfileId: profile.id,
            userId: profile.userId,
            baseSalaryKobo: profile.baseSalaryKobo,
            allowancesKobo,
            deductionsKobo,
            grossKobo,
            netKobo,
            currency: school.currency,
            breakdown: { allowances: profile.allowances ?? [], deductions: profile.deductions ?? [] } as unknown as Prisma.InputJsonValue,
          },
        });

        totalGrossKobo += grossKobo;
        totalDeductionsKobo += deductionsKobo;
        totalNetKobo += netKobo;
      }

      const updatedRun = await tx.payrollRun.update({
        where: { id: run.id },
        data: { totalGrossKobo, totalDeductionsKobo, totalNetKobo },
        include: RUN_INCLUDE,
      });

      await this.audit.log({
        schoolId,
        actorId: createdById,
        action: 'payroll_run.generated',
        entityType: 'PayrollRun',
        entityId: run.id,
        metadata: { periodLabel: dto.periodLabel, staffCount: staff.length, totalNetKobo },
      });

      return updatedRun;
    });
  }

  listRuns(schoolId: string) {
    return this.prisma.payrollRun.findMany({ where: { schoolId }, orderBy: { periodStart: 'desc' } });
  }

  async getRun(schoolId: string, id: string) {
    const run = await this.prisma.payrollRun.findFirst({ where: { id, schoolId }, include: RUN_INCLUDE });
    if (!run) throw new NotFoundException('Payroll run not found');
    return run;
  }

  /**
   * Builds the bank disbursement schedule for a run — one row per staff
   * member who is still owed money, with their bank details and net pay
   * in major units (naira, not kobo — banks expect decimal amounts, not
   * minor units). This is deliberately NOT an automated transfer: no
   * gateway call happens here. The school downloads this, feeds it into
   * their own bank's bulk-transfer upload (most Nigerian banks accept a
   * CSV/Excel schedule for exactly this), and then comes back to mark
   * each payslip paid — see PayrollService.markPaid.
   *
   * Only offered once a run is APPROVED — a DRAFT run's numbers aren't
   * final yet, so there's nothing safe to hand to a bank.
   */
  async buildDisbursementSchedule(schoolId: string, runId: string) {
    const run = await this.getRun(schoolId, runId);
    if (run.status === PayrollRunStatus.DRAFT) {
      throw new ConflictException('Approve this payroll run before generating a bank disbursement schedule');
    }

    const rows: DisbursementScheduleRow[] = [];
    const missingBankDetails: { fullName: string; staffId: string }[] = [];

    for (const payslip of run.payslips) {
      if (payslip.status === PayslipStatus.PAID) continue; // already settled — leave it off the next schedule

      const { bankName, bankAccountNumber, bankAccountName } = payslip.staffProfile;
      if (!bankName || !bankAccountNumber || !bankAccountName) {
        missingBankDetails.push({ fullName: payslip.user.fullName, staffId: payslip.staffProfile.staffId });
        continue; // can't schedule a transfer with no destination account
      }

      rows.push({
        payslipId: payslip.id,
        staffId: payslip.staffProfile.staffId,
        fullName: payslip.user.fullName,
        bankName,
        bankAccountNumber,
        bankAccountName,
        amountMajor: minorToMajor(payslip.netKobo, payslip.currency),
        currency: payslip.currency,
        narration: `Salary - ${run.periodLabel}`,
      });
    }

    return { run, rows, missingBankDetails };
  }

  /** CSV rendering of buildDisbursementSchedule — generic column set that most banks' bulk-upload templates can be remapped from in a spreadsheet, since every bank's own template differs. */
  toScheduleCsv(rows: DisbursementScheduleRow[]): string {
    const header = ['Staff ID', 'Full Name', 'Bank Name', 'Account Number', 'Account Name', 'Amount', 'Currency', 'Narration'];
    const escape = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
    const lines = [header.join(',')];
    for (const row of rows) {
      lines.push(
        [
          row.staffId,
          row.fullName,
          row.bankName ?? '',
          row.bankAccountNumber ?? '',
          row.bankAccountName ?? '',
          row.amountMajor.toFixed(2),
          row.currency,
          row.narration,
        ]
          .map(escape)
          .join(','),
      );
    }
    return lines.join('\r\n');
  }

  async approveRun(schoolId: string, id: string, approvedById: string) {
    const run = await this.getRun(schoolId, id);
    if (run.status !== PayrollRunStatus.DRAFT) {
      throw new ConflictException('Only a draft payroll run can be approved');
    }
    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollRunStatus.APPROVED, approvedById, approvedAt: new Date() },
      include: RUN_INCLUDE,
    });

    await this.notifications.notifyUsers(
      run.payslips.map((p) => p.userId),
      'Payslip ready',
      `Your payslip for ${run.periodLabel} is ready.`,
      '/staff/payroll',
    );

    await this.audit.log({ schoolId, actorId: approvedById, action: 'payroll_run.approved', entityType: 'PayrollRun', entityId: id });
    return updated;
  }

  /** Draft runs are fully regeneratable — delete and re-generate rather than editing in place, same philosophy as FeesService invoice generation. */
  async deleteRun(schoolId: string, id: string) {
    const run = await this.getRun(schoolId, id);
    if (run.status !== PayrollRunStatus.DRAFT) {
      throw new ConflictException('Only a draft payroll run can be deleted');
    }
    await this.prisma.$transaction([
      this.prisma.payslip.deleteMany({ where: { payrollRunId: id } }),
      this.prisma.payrollRun.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  /**
   * Records a payslip as paid. There is no automated bank-transfer
   * disbursement wired up yet — the platform's wallet ledger
   * (WalletService) is the SCHOOL's own billing balance with Elorge,
   * not a payout rail, and no transfer-capable gateway is configured
   * (PaymentsService only initiates INBOUND charges). So "paid" here
   * means the admin has moved the money outside the platform (bank
   * transfer, cash, etc.) and is recording that fact — which also
   * writes an ExpenseEntry (category "Salaries") so accounting stays in
   * sync automatically. Wiring a real payout gateway later is a matter
   * of calling it here before writing PAID, not changing this model.
   */
  async markPaid(schoolId: string, payslipId: string, paymentReference: string | undefined, actorId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id: payslipId, schoolId },
      include: { payrollRun: true, user: true, staffProfile: true },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    if (payslip.payrollRun.status === PayrollRunStatus.DRAFT) {
      throw new ConflictException('Approve the payroll run before marking any payslip as paid');
    }
    if (payslip.status === PayslipStatus.PAID) {
      throw new ConflictException('This payslip has already been marked paid');
    }

    const [expenseEntry] = await this.prisma.$transaction([
      this.prisma.expenseEntry.create({
        data: {
          schoolId,
          category: 'Salaries',
          description: `Salary — ${payslip.user.fullName} (${payslip.staffProfile.staffId}) — ${payslip.payrollRun.periodLabel}`,
          amountKobo: payslip.netKobo,
          incurredAt: new Date(),
          recordedById: actorId,
        },
      }),
    ]);

    const updated = await this.prisma.payslip.update({
      where: { id: payslipId },
      data: { status: PayslipStatus.PAID, paidAt: new Date(), paymentReference, expenseEntryId: expenseEntry.id },
    });

    const remainingUnpaid = await this.prisma.payslip.count({
      where: { payrollRunId: payslip.payrollRunId, status: { not: PayslipStatus.PAID } },
    });
    if (remainingUnpaid === 0) {
      await this.prisma.payrollRun.update({ where: { id: payslip.payrollRunId }, data: { status: PayrollRunStatus.PAID } });
    }

    await this.notifications.notifyUsers(
      [payslip.userId],
      'Salary paid',
      `Your salary for ${payslip.payrollRun.periodLabel} (${formatMoney(payslip.netKobo, payslip.currency)}) has been paid.`,
      '/staff/payroll',
    );

    await this.audit.log({
      schoolId,
      actorId,
      action: 'payslip.paid',
      entityType: 'Payslip',
      entityId: payslipId,
      metadata: { netKobo: payslip.netKobo, paymentReference },
    });

    return updated;
  }

  listMyPayslips(schoolId: string, userId: string) {
    return this.prisma.payslip.findMany({
      where: { schoolId, userId },
      include: { payrollRun: { select: { periodLabel: true, periodStart: true, periodEnd: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayslip(schoolId: string, id: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id, schoolId },
      include: { payrollRun: true, user: true, staffProfile: true },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }

  async renderPayslipPdf(schoolId: string, id: string): Promise<Buffer> {
    const payslip = await this.getPayslip(schoolId, id);
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
    const breakdown = payslip.breakdown as unknown as { allowances: SalaryLineItem[]; deductions: SalaryLineItem[] };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A5', margin: 36 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0B3D91').text(school.name);
      doc.moveDown(0.2);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text(`Payslip — ${payslip.payrollRun.periodLabel}`);
      doc.moveDown(0.6);

      doc.fontSize(9).font('Helvetica').fillColor('#333');
      doc.text(`Name: ${payslip.user.fullName}`);
      doc.text(`Staff ID: ${payslip.staffProfile.staffId}`);
      if (payslip.staffProfile.designation) doc.text(`Designation: ${payslip.staffProfile.designation}`);
      doc.text(`Status: ${payslip.status}${payslip.paidAt ? ` — paid ${payslip.paidAt.toISOString().slice(0, 10)}` : ''}`);
      doc.moveDown(0.6);

      doc.font('Helvetica-Bold').text('Earnings', { underline: true });
      doc.font('Helvetica').text(`Base salary: ${formatMoney(payslip.baseSalaryKobo, payslip.currency)}`);
      for (const a of breakdown.allowances ?? []) {
        doc.text(`${a.name}: ${formatMoney(a.amountKobo, payslip.currency)}`);
      }
      doc.font('Helvetica-Bold').text(`Gross: ${formatMoney(payslip.grossKobo, payslip.currency)}`);
      doc.moveDown(0.4);

      doc.font('Helvetica-Bold').text('Deductions', { underline: true });
      doc.font('Helvetica');
      if ((breakdown.deductions ?? []).length === 0) {
        doc.text('None');
      }
      for (const d of breakdown.deductions ?? []) {
        doc.text(`${d.name}: ${formatMoney(d.amountKobo, payslip.currency)}`);
      }
      doc.moveDown(0.4);

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1F9D55').text(`Net pay: ${formatMoney(payslip.netKobo, payslip.currency)}`);

      doc.end();
    });
  }
}
