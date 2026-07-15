// backend/src/common/guards/tenant.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
    select: { id: true, status: true },
  });
  if (!school) {
    throw new NotFoundException(`No school found for "${schoolSlug}"`);
  }

  const user = request.user;
  const isPlatformWide = !!user && (user.role === Role.SUPER_ADMIN || user.role === Role.FINANCE_OPS);

  // Suspension blocks STAFF/ADMIN access only — a billing lever against
  // the school, not against a parent who already has a right to see
  // their child's existing results. Public routes (result lookup,
  // published lesson notes, session wrap) stay reachable even while
  // suspended; platform-wide staff are exempt entirely so they can
  // review/reactivate the school.
  if (school.status === 'SUSPENDED' && user && !isPlatformWide) {
    throw new ForbiddenException('This school\'s account is currently suspended. Contact Elorge support.');
  }

  // FIX: public routes (e.g. results/lookup) have no request.user at all —
  // only enforce the ownership check when a user is actually present.
  if (user) {
    if (!isPlatformWide && user.schoolId !== school.id) {
      throw new ForbiddenException('You do not have access to this school');
    }
  }

  request.schoolId = school.id;
  return true;
}
}