// backend/src/modules/leads/leads.module.ts
import { Global, Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

// @Global so chat, signup and demo requests can record leads without importing this module.
@Global()
@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
