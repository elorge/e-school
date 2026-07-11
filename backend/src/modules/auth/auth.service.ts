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
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, schoolId: user.schoolId },
    };
  }

  async createUser(email: string, password: string, fullName: string, role: Role, schoolId?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, fullName, role, schoolId },
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

  /**
   * Step 1 of the self-service reset flow. Always responds the same way
   * whether or not the email exists, to avoid leaking which emails are
   * registered — the controller should return a generic "if that email
   * exists, we've sent a link" message regardless of this method's result.
   */
  async requestPasswordReset(email: string, resetUrlBase: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // silently no-op — see docstring above

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    await this.emailService.sendPasswordReset({
      toEmail: user.email,
      fullName: user.fullName,
      resetUrl: `${resetUrlBase}?token=${rawToken}`,
    });
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