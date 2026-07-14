// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { JwtPayload } from '../../common/types/auth.types';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes, matches the copy in passwordResetEmail
const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — a teacher may not check email same-day, unlike an active "I forgot my password right now" reset
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: JwtPayload = { sub: user.id, role: user.role, schoolId: user.schoolId };

    let schoolSlug: string | null = null;
    if (user.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: user.schoolId }, select: { slug: true } });
      schoolSlug = school?.slug ?? null;
    }

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        schoolId: user.schoolId,
        schoolSlug,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

async createUser(email: string, password: string, fullName: string, role: Role, schoolId?: string, mustChangePassword = false) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, fullName, role, schoolId, mustChangePassword },
      select: { id: true, email: true, fullName: true, role: true, schoolId: true, createdAt: true },
    });

    if (schoolId) {
      const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
      await this.emailService.sendStaffAccountCreated({
        toEmail: user.email,
        fullName: user.fullName,
        schoolName: school.name,
        role: user.role,
      });
    }
    // Platform-wide SUPER_ADMIN/FINANCE_OPS accounts (no schoolId) skip the
    // "welcome to your school" framing entirely — there's no school to
    // name. If you want a distinct platform-staff welcome email later,
    // add a separate template rather than overloading this one.

    return user;
  }

/** Shared by requestPasswordReset and inviteStaff — both need "issue a single-use hashed token", just with different TTLs and different emails on top. */
  private async issueResetToken(userId: string, ttlMs: number): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt: new Date(Date.now() + ttlMs) },
    });

    return rawToken;
  }

  async requestPasswordReset(email: string, resetUrlBase: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // silently no-op — see docstring above

    const rawToken = await this.issueResetToken(user.id, RESET_TOKEN_TTL_MS);

    await this.emailService.sendPasswordReset({
      toEmail: user.email,
      fullName: user.fullName,
      resetUrl: `${resetUrlBase}?token=${rawToken}`,
    });
  }

  /**
   * Creates a STAFF account with a random, never-disclosed password —
   * the account is genuinely unusable until the teacher completes
   * activation via the emailed link, which lands on the SAME
   * reset-password page/flow as a normal forgotten-password reset.
   * Nothing new to build on the frontend for this to work.
   */
  async inviteStaff(schoolId: string, email: string, fullName: string, resetUrlBase: string) {
    const unusablePassword = randomBytes(24).toString('hex');
    const passwordHash = await bcrypt.hash(unusablePassword, 10);

    const user = await this.prisma.user.create({
      data: { email, passwordHash, fullName, role: Role.STAFF, schoolId },
      select: { id: true, email: true, fullName: true, role: true, schoolId: true, createdAt: true },
    });

    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
    const rawToken = await this.issueResetToken(user.id, INVITE_TOKEN_TTL_MS);

    await this.emailService.sendStaffInvite({
      toEmail: user.email,
      fullName: user.fullName,
      schoolName: school.name,
      activateUrl: `${resetUrlBase}?token=${rawToken}`,
    });

    return user;
  }

  /** Step 2: consume a raw reset token (from the emailed link) to set a new password. */
  async resetPasswordWithToken(rawToken: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This password reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
  }

  /** Self-service change while already logged in — requires knowing the current password, unlike the token-based reset flow. Clears mustChangePassword on success. */
  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
      select: { id: true, email: true },
    });
  }
  
  /** SUPER_ADMIN-initiated direct reset — no token involved, used for account recovery support cases. */
  async resetPassword(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true, email: true },
    });
  }
}