// backend/src/modules/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';

@Module({
  providers: [],
  controllers: [AuditController],
})
export class AuditLogModule {}