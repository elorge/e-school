// backend/src/modules/schools/schools.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../../common/services/audit.service';
import { SignupRequestStatus } from '@prisma/client';
import { PLATFORM_DEFAULT_PRICE_PER_STUDENT_KOBO, WELCOME_BONUS_KOBO } from '../../common/constants';
import { timezoneForCountry } from '../../common/utils/timezone.util';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  findBySlug(slug: string) {
    return this.prisma.school.findUnique({ where: { slug } });
  }

  /** SUPER_ADMIN only — full directory, used by the school-management panel. */
  listAll() {
    return this.prisma.school.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async suspend(slug: string) {
    const school = await this.prisma.school.update({ where: { slug }, data: { status: 'SUSPENDED' } });
    await this.audit.log({ schoolId: school.id, action: 'school.suspended', entityType: 'School', entityId: school.id });
    return school;
  }

  async reactivate(slug: string) {
    const school = await this.prisma.school.update({ where: { slug }, data: { status: 'ACTIVE' } });
    await this.audit.log({ schoolId: school.id, action: 'school.reactivated', entityType: 'School', entityId: school.id });
    return school;
  }

  async findByIdOrThrow(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  /**
   * Onboards a new school, grants the one-time welcome bonus (spec doc
   * §7.5), and emails the school's first admin. `adminEmail`/`adminName`
   * are the credentials of the SCHOOL_ADMIN this school is being created
   * for — the controller/caller is responsible for also creating that
   * User via AuthService (order: school first, then admin user, since the
   * admin user's schoolId FK needs the school to already exist).
   *
   * `countryCode`/`currency` are required — every school operates in a
   * specific country and charges through Flutterwave in a specific
   * currency; there is no platform-wide default to silently fall back to
   * (see CreateSchoolDto / CreateSignupRequestDto for validation).
   */
  async create(data: {
    slug: string;
    name: string;
    code: string;
    countryCode: string;
    currency: string;
    timezone?: string;
    logoUrl?: string;
    adminEmail: string;
    adminName: string;
  }) {
    const school = await this.prisma.school.create({
      data: {
        slug: data.slug,
        name: data.name,
        code: data.code,
        countryCode: data.countryCode,
        currency: data.currency,
        timezone: data.timezone ?? timezoneForCountry(data.countryCode),
        logoUrl: data.logoUrl,
      },
    });
    await this.walletService.grantWelcomeBonus(school.id, WELCOME_BONUS_KOBO);

    await this.emailService.sendSchoolWelcome({
      toEmail: data.adminEmail,
      toName: data.adminName,
      schoolName: school.name,
      slug: school.slug,
      welcomeBonusKobo: WELCOME_BONUS_KOBO,
      currency: school.currency,
    });

    return school;
  }

  async setPriceOverride(slug: string, koboAmount: number | null | undefined) {
    return this.prisma.school.update({
      where: { slug },
      data: { pricePerStudentKoboOverride: koboAmount ?? null },
    });
  }

  async setSessionWrapEnabled(slug: string, enabled: boolean) {
    return this.prisma.school.update({
      where: { slug },
      data: { sessionWrapEnabled: enabled },
    });
  }

  async getEffectivePricePerStudentKobo(schoolId: string): Promise<number> {
    const school = await this.findByIdOrThrow(schoolId);
    return school.pricePerStudentKoboOverride ?? PLATFORM_DEFAULT_PRICE_PER_STUDENT_KOBO;
  }

  /** Public entry point — creates nothing yet, just queues a request for SUPER_ADMIN review. */
  // NOTE: SchoolSignupRequest.timezone is required in the schema — default
  // it from countryCode here, same as create() does for School.
  // approveSignupRequest() carries this value straight through onto the
  // new School row rather than recomputing it, so a school whose timezone
  // was corrected between signup and approval keeps that value.
  async createSignupRequest(data: {
    schoolName: string;
    slug: string;
    code: string;
    countryCode: string;
    currency: string;
    timezone?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    phone?: string;
  }) {
    const [slugTaken, codeTaken] = await Promise.all([
      this.prisma.school.findUnique({ where: { slug: data.slug } }),
      this.prisma.school.findUnique({ where: { code: data.code } }),
    ]);
    if (slugTaken) throw new ConflictException('That workspace name is already taken');
    if (codeTaken) throw new ConflictException('That school code is already taken');

    const adminPasswordHash = await bcrypt.hash(data.adminPassword, 10);
    const result = await this.prisma.schoolSignupRequest.create({
      data: {
        schoolName: data.schoolName,
        slug: data.slug,
        code: data.code,
        countryCode: data.countryCode,
        timezone: data.timezone ?? timezoneForCountry(data.countryCode),
        currency: data.currency,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: adminPasswordHash,
        phone: data.phone,
      },
      select: { id: true, schoolName: true, slug: true, status: true, createdAt: true },
    });

    const superAdmins = await this.prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    await this.notificationsService.notifyUsers(
      superAdmins.map((u) => u.id),
      'New school signup request',
      `${data.schoolName} is waiting for approval.`,
      '/super-admin',
    );

    return result;
  }

  listSignupRequests(status?: SignupRequestStatus) {
    return this.prisma.schoolSignupRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approves a pending request: creates the real School + its first
   * SCHOOL_ADMIN user directly from the already-hashed password on file
   * — no second password prompt needed. Reuses `create()` below to stay
   * consistent with the existing sales-assisted flow. countryCode/currency/
   * timezone flow straight through from the signup request onto the new
   * School row (timezone is passed as-is, not recomputed, in case it was
   * corrected after signup but before approval).
   */
  async approveSignupRequest(requestId: string) {
    const request = await this.prisma.schoolSignupRequest.findUniqueOrThrow({ where: { id: requestId } });
    if (request.status !== SignupRequestStatus.PENDING) {
      throw new ConflictException('This request has already been reviewed');
    }

    const school = await this.create({
      slug: request.slug,
      name: request.schoolName,
      code: request.code,
      countryCode: request.countryCode,
      currency: request.currency,
      timezone: request.timezone,
      adminEmail: request.adminEmail,
      adminName: request.adminName,
    });

    // Insert the admin user directly with the ALREADY-HASHED password
    // from signup — bypasses AuthService.createUser (which hashes a raw
    // password) since we only ever stored the hash.
    await this.prisma.user.create({
      data: {
        schoolId: school.id,
        role: 'SCHOOL_ADMIN',
        email: request.adminEmail,
        passwordHash: request.adminPassword,
        fullName: request.adminName,
      },
    });

    await this.prisma.schoolSignupRequest.update({
      where: { id: requestId },
      data: { status: SignupRequestStatus.APPROVED, reviewedAt: new Date() },
    });

    return school;
  }

  async rejectSignupRequest(requestId: string) {
    return this.prisma.schoolSignupRequest.update({
      where: { id: requestId },
      data: { status: SignupRequestStatus.REJECTED, reviewedAt: new Date() },
    });
  }

  /** Partial, case-insensitive match on name or slug — for type-ahead search, not exact lookup. */
  search(q: string) {
    if (!q || q.trim().length < 2) return [];
    return this.prisma.school.findMany({
      where: {
        OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }],
      },
      take: 10,
      orderBy: { name: 'asc' },
    });
  }
}