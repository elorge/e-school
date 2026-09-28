// backend/src/common/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ALLOW_HR_KEY } from '../decorators/allow-hr.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Must run after JwtAuthGuard so `request.user` is populated. Registered
 * globally via APP_GUARD in app.module.ts — this is the ONLY guard
 * instance that runs for every request, ahead of any per-controller
 * `@UseGuards(...)`, so the @AllowHr() escape hatch has to live here
 * rather than in a separate guard: a controller-level guard would run
 * too late, after this one had already thrown.
 *
 * There is no dedicated HR value in the Role enum (see schema.prisma) —
 * a school can flag any number of ordinary STAFF accounts as HR via
 * StaffProfile.isHrManager, so "is this caller HR" is a per-profile flag,
 * not a role. @AllowHr() marks a route (in addition to its @Roles() list)
 * as reachable by such a STAFF account; @Roles() alone never grants that,
 * since it only ever checks the JWT's role claim.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) throw new ForbiddenException('You do not have permission to perform this action');
    if (requiredRoles.includes(user.role)) return true;

    // Fallback: an HR-flagged STAFF account on a route that opted in via
    // @AllowHr(). Only reached once the plain role check above has
    // already failed, so this DB lookup never runs on the common path
    // (SCHOOL_ADMIN calling an admin route, or any role calling a route
    // it's already allowed on).
    //
    // Deliberately keyed off user.schoolId (from the JWT, set by
    // JwtAuthGuard) rather than request.schoolId: RolesGuard is a global
    // APP_GUARD and therefore runs BEFORE any per-controller TenantGuard,
    // so request.schoolId is not populated yet at this point.
    const allowHr = this.reflector.getAllAndOverride<boolean>(ALLOW_HR_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowHr && user.role === Role.STAFF && user.schoolId) {
      const profile = await this.prisma.staffProfile.findUnique({
        where: { userId: user.id },
        select: { isHrManager: true },
      });
      if (profile?.isHrManager) return true;
    }

    throw new ForbiddenException('You do not have permission to perform this action');
  }
}
