// backend/src/modules/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditController, SchoolAuditController } from './audit.controller';

@Module({
  providers: [],
  controllers: [AuditController, SchoolAuditController],
})
export class AuditLogModule {}