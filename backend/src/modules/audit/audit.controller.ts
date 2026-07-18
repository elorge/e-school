// backend/src/modules/audit/audit.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesGuard } from '../../common/guards/roles.guard';
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