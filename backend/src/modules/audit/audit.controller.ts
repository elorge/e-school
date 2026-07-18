// backend/src/modules/audit/audit.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(RolesGuard)
@Controller('platform/audit-log')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  list(@Query('schoolId') schoolId?: string) {
    return this.prisma.auditLog.findMany({
      where: schoolId ? { schoolId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

/**
 * Separate controller, separate path — deliberately NOT reusing the
 * platform-wide one above. A School Admin must only ever see entries
 * scoped to their OWN school (enforced via TenantGuard's schoolId, not
 * a query param the client could tamper with), and must never see
 * platform-level entries (school.suspended, wallet.manual_credit for
 * OTHER schools) even by accident.
 */
@UseGuards(TenantGuard, RolesGuard)
@Controller(':school/audit-log')
export class SchoolAuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Get()
  list(@Req() req: Request) {
    return this.prisma.auditLog.findMany({
      where: { schoolId: req.schoolId! },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}