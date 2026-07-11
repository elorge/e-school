// backend/src/modules/pins/pins.service.ts
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../email/email.service';
import { PinStatus, Role } from '@prisma/client';
import { MAX_PIN_LOOKUP_ATTEMPTS } from '../../common/constants';

const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

@Injectable()
export class PinsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly emailService: EmailService,
  ) {}

  async generateBatch(
    schoolId: string,
    termId: string,
    studentIds: string[],
    pricePerStudentKobo: number,
    idempotencyKey: string,
  ) {
    const totalCostKobo = studentIds.length * pricePerStudentKobo;

    // Debit first — if this throws (insufficient balance), nothing else
    // has happened yet, so there's nothing to roll back.
    await this.walletService.debitForPinGeneration(schoolId, totalCostKobo, idempotencyKey);

    await this.prisma.pin.updateMany({
      where: { schoolId, termId, studentId: { in: studentIds }, status: PinStatus.ACTIVE },
      data: { status: PinStatus.INVALIDATED },
    });

    const generated: { studentId: string; plaintextPin: string }[] = [];
    try {
      for (const studentId of studentIds) {
        const plaintextPin = String(randomInt(0, 1_000_000)).padStart(6, '0');
        const pinHash = await bcrypt.hash(plaintextPin, 10);

        await this.prisma.pin.create({
          data: { schoolId, studentId, termId, pinHash, status: PinStatus.ACTIVE },
        });

        generated.push({ studentId, plaintextPin });
      }
    } catch (err) {
      // Debit succeeded but generation didn't complete — refund rather
      // than leave the school charged for PINs it never got. See spec
      // doc §7.4.
      await this.walletService.refund(schoolId, totalCostKobo, `refund-${idempotencyKey}`);
      throw err;
    }

    // Notify School Admins — fire-and-forget, per EmailService's own
    // contract (never throws, so no try/catch needed here).
    const [school, term, admins] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } }),
      this.prisma.term.findUniqueOrThrow({ where: { id: termId } }),
      this.prisma.user.findMany({ where: { schoolId, role: Role.SCHOOL_ADMIN } }),
    ]);
    await Promise.all(
      admins.map((admin) =>
        this.emailService.sendPinsGenerated({
          toEmail: admin.email,
          toName: admin.fullName,
          schoolName: school.name,
          termName: term.name,
          studentCount: studentIds.length,
          totalCostKobo,
        }),
      ),
    );

    return generated;
  }

/**
   * Verifies admissionId + PIN under the same rate-limit/lockout rules
   * as a result lookup, and returns the authenticated student (with the
   * PIN's termId) on success — WITHOUT fetching a result. Shared by
   * lookupResult below and any other public, PIN-gated endpoint (e.g.
   * the Session Wrap lookup) so lockout logic exists in exactly one
   * place.
   */
  async verifyPin(schoolId: string, admissionId: string, plaintextPin: string) {
    const attempt = await this.prisma.pinLookupAttempt.upsert({
      where: { schoolId_admissionId: { schoolId, admissionId } },
      create: { schoolId, admissionId },
      update: {},
    });

    const now = new Date();
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      throw new ForbiddenException(`Too many failed attempts. Try again after ${attempt.lockedUntil.toISOString()}.`);
    }
    if (attempt.lockedUntil && attempt.lockedUntil <= now) {
      await this.prisma.pinLookupAttempt.update({
        where: { schoolId_admissionId: { schoolId, admissionId } },
        data: { failedAttempts: 0, lockedUntil: null },
      });
      attempt.failedAttempts = 0;
    }

    const fail = async () => {
      const failedAttempts = attempt.failedAttempts + 1;
      const shouldLock = failedAttempts >= MAX_PIN_LOOKUP_ATTEMPTS;
      await this.prisma.pinLookupAttempt.update({
        where: { schoolId_admissionId: { schoolId, admissionId } },
        data: {
          failedAttempts,
          lockedUntil: shouldLock ? new Date(now.getTime() + LOCKOUT_DURATION_MS) : null,
          lastAttemptAt: now,
        },
      });
    };

    const student = await this.prisma.student.findFirst({ where: { schoolId, studentId: admissionId } });
    if (!student) {
      await fail();
      throw new UnauthorizedException('Invalid credentials');
    }

    const pin = await this.prisma.pin.findFirst({
      where: { schoolId, studentId: student.id, status: PinStatus.ACTIVE },
    });
    if (!pin) {
      await fail();
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(plaintextPin, pin.pinHash);
    if (!valid) {
      await fail();
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.pinLookupAttempt.update({
      where: { schoolId_admissionId: { schoolId, admissionId } },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    return { student, pin };
  }

  async lookupResult(schoolId: string, admissionId: string, plaintextPin: string) {
    const { student, pin } = await this.verifyPin(schoolId, admissionId, plaintextPin);
    return this.prisma.resultEntry.findFirst({
      where: { schoolId, studentId: student.id, termId: pin.termId },
    });
  }
}