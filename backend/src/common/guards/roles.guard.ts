// backend/src/common/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Must run after JwtAuthGuard so `request.user` is populated. Registered
 * globally via APP_GUARD in app.module.ts.
 *
 * Access model (deliberately simple — there is no separate "HR" gate):
 *   - SCHOOL_ADMIN is the single authority for HR: staff directory,
 *     payroll, leave approval, ID-card approval. The admin is the final
 *     approver of everything.
 *   - STAFF may only ever act on their own records (own profile, own
 *     leave, own payslips, own ID card). Controllers enforce the
 *     "own records only" part by resolving the caller's profile from the
 *     JWT, never from a client-supplied id.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user = context.switchToHttp().getRequest<Request>().user;
    if (user && requiredRoles.includes(user.role)) return true;

    throw new ForbiddenException('You do not have permission to perform this action');
  }
}
