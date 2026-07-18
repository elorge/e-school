// backend/src/common/services/audit.module.ts
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

// @Global so any module can inject AuditService without re-importing —
// same pattern as PrismaModule, since audit writes happen everywhere.
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}