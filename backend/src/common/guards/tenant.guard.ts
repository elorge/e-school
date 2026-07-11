// backend/src/common/guards/tenant.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TenantGuard
 *
 * Every request that touches tenant-scoped data must resolve a school_id
 * (from the path-based route, e.g. /:school/..., where `:school` is the
 * School's slug). This guard is the single place that resolves and
 * attaches `request.schoolId` — controllers/services should never trust a
 * school_id passed in the request body.
 *
 * Must run AFTER JwtAuthGuard (so request.user is populated — JwtAuthGuard
 * is global, see AppModule). SUPER_ADMIN and FINANCE_OPS are
 * platform-wide and may access any tenant; everyone else must belong to
 * the resolved school.
 *
 * This is the application-level backstop. It works alongside, not instead
 * of, PostgreSQL Row-Level Security policies on tenant-scoped tables — see
 * the "Multi-Tenancy Strategy" section of the spec doc.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest<Request>();
  const schoolSlug = request.params?.school;

  if (!schoolSlug) {
    throw new ForbiddenException('No school context on this request');
  }

  const school = await this.prisma.school.findUnique({
    where: { slug: schoolSlug },
    select: { id: true },
  });
  if (!school) {
    throw new NotFoundException(`No school found for "${schoolSlug}"`);
  }

  const user = request.user;
  // FIX: public routes (e.g. results/lookup) have no request.user at all —
  // only enforce the ownership check when a user is actually present.
  if (user) {
    const isPlatformWide = user.role === Role.SUPER_ADMIN || user.role === Role.FINANCE_OPS;
    if (!isPlatformWide && user.schoolId !== school.id) {
      throw new ForbiddenException('You do not have access to this school');
    }
  }

  request.schoolId = school.id;
  return true;
}
}