// backend/src/modules/staff/staff.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StaffService } from './staff.service';
import { StaffIdCardsService } from './staff-id-cards.service';
import { StaffController } from './staff.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule.register({ timeout: 8000 }), NotificationsModule],
  providers: [StaffService, StaffIdCardsService],
  controllers: [StaffController],
  exports: [StaffService], // consumed by PayrollModule and LeaveModule to resolve a caller's own StaffProfile
})
export class StaffModule {}
