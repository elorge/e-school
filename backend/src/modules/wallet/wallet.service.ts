// backend/src/modules/wallet/wallet.service.ts
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LedgerSource, LedgerStatus, LedgerType, Role, Prisma } from '@prisma/client';
import { LOW_BALANCE_WARNING_THRESHOLD_KOBO } from '../../common/constants';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /** Balance is always derived — never stored directly. See spec doc §7.4. */
  async getBalanceKobo(schoolId: string): Promise<number> {
    const [credits, debits] = await Promise.all([
      this.prisma.walletLedgerEntry.aggregate({
        where: { schoolId, type: LedgerType.CREDIT, status: LedgerStatus.CONFIRMED },
        _sum: { amountKobo: true },
      }),
      this.prisma.walletLedgerEntry.aggregate({
        where: { schoolId, type: LedgerType.DEBIT, status: LedgerStatus.CONFIRMED },
        _sum: { amountKobo: true },
      }),
    ]);
    return (credits._sum.amountKobo ?? 0) - (debits._sum.amountKobo ?? 0);
  }

  /**
   * School Admins are the notification recipients for wallet events —
   * there's no dedicated "billing contact" field on School, so every
   * SCHOOL_ADMIN user at the school gets these. Fetched fresh each call
   * rather than cached, since staff lists change.
   */
  private async getSchoolAndAdmins(schoolId: string) {
    const [school, admins] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.user.findMany({ where: { schoolId, role: Role.SCHOOL_ADMIN } }),
    ]);
    return { school, admins };
  }

  private async notifyAdmins(
    schoolId: string,
    send: (admin: { email: string; fullName: string }, schoolName: string) => Promise<unknown>,
  ) {
    const { school, admins } = await this.getSchoolAndAdmins(schoolId);
    // Fire in parallel; EmailService methods never throw (see EmailService
    // docstring), so no try/catch needed here — a Brevo outage must never
    // affect the wallet/PIN transaction that triggered the notification.
    await Promise.all(admins.map((admin) => send({ email: admin.email, fullName: admin.fullName }, school.name)));
  }

  /**
   * Confirm a gateway payment via verified webhook. Idempotent on
   * reference: calling this twice for the same gateway transaction
   * reference is a no-op the second time.
   */
  async creditFromGateway(schoolId: string, amountKobo: number, reference: string) {
    const existing = await this.prisma.walletLedgerEntry.findUnique({ where: { reference } });
    if (existing) return existing;

    const entry = await this.prisma.walletLedgerEntry.create({
      data: {
        schoolId,
        type: LedgerType.CREDIT,
        amountKobo,
        source: LedgerSource.GATEWAY,
        status: LedgerStatus.CONFIRMED,
        reference,
      },
    });

    const newBalanceKobo = await this.getBalanceKobo(schoolId);
    await this.notifyAdmins(schoolId, (admin, schoolName) =>
      this.emailService.sendWalletCreditConfirmed({
        toEmail: admin.email,
        toName: admin.fullName,
        schoolName,
        amountKobo,
        newBalanceKobo,
        source: 'card/bank payment',
      }),
    );

    return entry;
  }

  /**
   * A manual credit issued directly by Elorge platform staff — outside
   * the gateway/bank-transfer flow entirely. Used for goodwill credits,
   * billing corrections, or any case where the money movement happened
   * somewhere off-platform and just needs to be reflected here.
   */
  async manualCredit(schoolId: string, amountKobo: number, reason: string, approvedByUserId: string) {
    if (amountKobo <= 0) throw new BadRequestException('Amount must be positive');

    const entry = await this.prisma.walletLedgerEntry.create({
      data: {
        schoolId,
        type: LedgerType.CREDIT,
        amountKobo,
        source: LedgerSource.ADMIN_CREDIT,
        status: LedgerStatus.CONFIRMED,
        reference: `admin-credit-${randomUUID()}`,
        approvedById: approvedByUserId,
      },
    });

    const newBalanceKobo = await this.getBalanceKobo(schoolId);
    await this.notifyAdmins(schoolId, (admin, schoolName) =>
      this.emailService.sendWalletCreditConfirmed({
        toEmail: admin.email,
        toName: admin.fullName,
        schoolName,
        amountKobo,
        newBalanceKobo,
        source: reason || 'Platform credit',
      }),
    );

    return entry;
  }

  /**
   * One-time ₦100,000 welcome credit for a newly onboarded school. See
   * SchoolsService.create for the accompanying welcome email — this
   * method itself stays silent so a retry of school creation doesn't
   * re-send it (grantWelcomeBonus is idempotent; the email is sent once,
   * from the caller, only on first creation).
   */
  async grantWelcomeBonus(schoolId: string, amountKobo = 10_000_000 /* ₦100,000 */) {
    const reference = `welcome-bonus-${schoolId}`;
    const existing = await this.prisma.walletLedgerEntry.findUnique({ where: { reference } });
    if (existing) return existing;

    return this.prisma.walletLedgerEntry.create({
      data: {
        schoolId,
        type: LedgerType.CREDIT,
        amountKobo,
        source: LedgerSource.PROMO,
        status: LedgerStatus.CONFIRMED,
        reference,
      },
    });
  }

  async getBalanceInStudentUnits(schoolId: string, pricePerStudentKobo: number) {
    const balanceKobo = await this.getBalanceKobo(schoolId);
    return {
      balanceKobo,
      studentPinsAvailable: Math.floor(balanceKobo / pricePerStudentKobo),
    };
  }

  /** Manual bank transfer claim — created as pending, does not move balance yet. */
  async submitManualTransferClaim(schoolId: string, amountKobo: number, reference: string) {
    const entry = await this.prisma.walletLedgerEntry.create({
      data: {
        schoolId,
        type: LedgerType.CREDIT,
        amountKobo,
        source: LedgerSource.MANUAL_TRANSFER,
        status: LedgerStatus.PENDING,
        reference,
      },
    });

    await this.notifyAdmins(schoolId, (admin, schoolName) =>
      this.emailService.sendManualTransferSubmitted({
        toEmail: admin.email,
        toName: admin.fullName,
        schoolName,
        amountKobo,
        reference,
      }),
    );

    return entry;
  }

 /** Platform-wide — every school's pending manual transfer claims, for Finance/Ops to work through. */
  listPendingManualTransfers() {
    return this.prisma.walletLedgerEntry.findMany({
      where: { source: 'MANUAL_TRANSFER', status: 'PENDING' },
      include: { school: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Finance/Ops approves or rejects a pending manual transfer claim. */
  async resolveManualTransferClaim(entryId: string, approvedByUserId: string, approve: boolean) {
    const entry = await this.prisma.walletLedgerEntry.findUniqueOrThrow({ where: { id: entryId } });
    if (entry.status !== LedgerStatus.PENDING) {
      throw new ConflictException('This claim has already been resolved');
    }

    const updated = await this.prisma.walletLedgerEntry.update({
      where: { id: entryId },
      data: {
        status: approve ? LedgerStatus.CONFIRMED : LedgerStatus.REJECTED,
        approvedById: approvedByUserId,
      },
    });

    await this.notifyAdmins(entry.schoolId, (admin, schoolName) =>
      this.emailService.sendManualTransferResolved({
        toEmail: admin.email,
        toName: admin.fullName,
        schoolName,
        amountKobo: entry.amountKobo,
        approved: approve,
        reference: entry.reference,
      }),
    );

    if (approve) {
      const newBalanceKobo = await this.getBalanceKobo(entry.schoolId);
      await this.notifyAdmins(entry.schoolId, (admin, schoolName) =>
        this.emailService.sendWalletCreditConfirmed({
          toEmail: admin.email,
          toName: admin.fullName,
          schoolName,
          amountKobo: entry.amountKobo,
          newBalanceKobo,
          source: 'bank transfer',
        }),
      );
    }

    return updated;
  }

/**
   * ONE charge per (student, term) unlocks BOTH PIN generation and CBT
   * for that student that term — not two separate debits. Whichever
   * happens first (PIN generation or CBT publish) pays; the other is
   * free for that same student+term, because the underlying product is
   * the same thing: this student's verified result for this term.
   */
  async debitPlatformAccessFee(schoolId: string, studentId: string, termId: string, amountKobo: number) {
    const reference = `platform-access-${schoolId}-${studentId}-${termId}`;
    const existing = await this.prisma.walletLedgerEntry.findUnique({ where: { reference } });
    if (existing) return { entry: existing, alreadyCharged: true };

    const balance = await this.getBalanceKobo(schoolId);
    if (balance < amountKobo) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const entry = await this.prisma.walletLedgerEntry.create({
      data: { schoolId, type: LedgerType.DEBIT, amountKobo, source: LedgerSource.SYSTEM, status: LedgerStatus.CONFIRMED, reference },
    });

    const newBalanceKobo = await this.getBalanceKobo(schoolId);
    if (newBalanceKobo < LOW_BALANCE_WARNING_THRESHOLD_KOBO) {
      await this.notifyAdmins(schoolId, (admin, schoolName) =>
        this.emailService.sendLowBalanceWarning({ toEmail: admin.email, toName: admin.fullName, schoolName, balanceKobo: newBalanceKobo }),
      );
    }

    return { entry, alreadyCharged: false };
  }
  
  async debitForPinGeneration(schoolId: string, amountKobo: number, idempotencyKey: string) {
    const entry = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.walletLedgerEntry.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const [credits, debits] = await Promise.all([
        tx.walletLedgerEntry.aggregate({
          where: { schoolId, type: LedgerType.CREDIT, status: LedgerStatus.CONFIRMED },
          _sum: { amountKobo: true },
        }),
        tx.walletLedgerEntry.aggregate({
          where: { schoolId, type: LedgerType.DEBIT, status: LedgerStatus.CONFIRMED },
          _sum: { amountKobo: true },
        }),
      ]);
      const balance = (credits._sum.amountKobo ?? 0) - (debits._sum.amountKobo ?? 0);
      if (balance < amountKobo) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      return tx.walletLedgerEntry.create({
        data: {
          schoolId,
          type: LedgerType.DEBIT,
          amountKobo,
          source: LedgerSource.SYSTEM,
          status: LedgerStatus.CONFIRMED,
          reference: `debit-${idempotencyKey}`,
          idempotencyKey,
        },
      });
    });

    const newBalanceKobo = await this.getBalanceKobo(schoolId);
    if (newBalanceKobo < LOW_BALANCE_WARNING_THRESHOLD_KOBO) {
      await this.notifyAdmins(schoolId, (admin, schoolName) =>
        this.emailService.sendLowBalanceWarning({
          toEmail: admin.email,
          toName: admin.fullName,
          schoolName,
          balanceKobo: newBalanceKobo,
        }),
      );
    }

    return entry;
    // Caller (PinsService) is responsible for generating the PINs
    // themselves and refunding via `refund()` below if that fails.
  }

  /**
   * Reverses a debit that succeeded but whose downstream work (e.g. PIN
   * creation) failed partway through — see PinsService.generateBatch.
   * Idempotent on reference: safe to call twice for the same failed
   * attempt.
   */
  async refund(schoolId: string, amountKobo: number, reference: string) {
    const existing = await this.prisma.walletLedgerEntry.findUnique({ where: { reference } });
    if (existing) return existing;

    return this.prisma.walletLedgerEntry.create({
      data: {
        schoolId,
        type: LedgerType.CREDIT,
        amountKobo,
        source: LedgerSource.REFUND,
        status: LedgerStatus.CONFIRMED,
        reference,
      },
    });
  }
}