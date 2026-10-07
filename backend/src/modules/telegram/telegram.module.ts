// backend/src/modules/telegram/telegram.module.ts
import { Global, Module } from '@nestjs/common';
import { StaffAlertsService } from './staff-alerts.service';
import { TelegramService } from './telegram.service';

// @Global so schools, wallet, payments and chat can post to the staff group
// without each module importing this one.
@Global()
@Module({
  providers: [TelegramService, StaffAlertsService],
  exports: [TelegramService, StaffAlertsService],
})
export class TelegramModule {}
