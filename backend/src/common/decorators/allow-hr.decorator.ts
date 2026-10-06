// backend/src/common/decorators/allow-hr.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ALLOW_HR_KEY = 'allowHr';

/**
 * Marks a route as reachable by a STAFF account whose StaffProfile has
 * isHrManager = true, in addition to whatever @Roles() already allows.
 * Only has an effect where it's actually read — RolesGuard (registered
 * globally via APP_GUARD in app.module.ts) is the only place that reads
 * this metadata; @Roles() alone never grants HR access on its own, since
 * it only ever checks the JWT's role claim, which has no concept of the
 * HR flag.
 */
export const AllowHr = () => SetMetadata(ALLOW_HR_KEY, true);
