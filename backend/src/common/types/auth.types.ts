// backend/src/common/types/auth.types.ts
import { Role } from '@prisma/client';

/** Shape of the payload we sign into the JWT (see AuthService.login). */
export interface JwtPayload {
  sub: string; // user id
  role: Role;
  schoolId: string | null;
}

/** What we attach to `request.user` after JwtAuthGuard runs. */
export interface AuthenticatedUser {
  id: string;
  role: Role;
  schoolId: string | null;
}

/** Augment Express's Request with the fields our guards attach. */
declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
    /** Resolved by TenantGuard from the `:school` route param. Controllers
     * and services must use this instead of trusting any school id that
     * might appear in the request body. */
    schoolId?: string;
  }
}