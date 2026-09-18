// backend/src/modules/leave/leave.module.ts
import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { StaffModule } from '../staff/staff.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [StaffModule, NotificationsModule],
  providers: [LeaveService],
  controllers: [LeaveController],
})
export class LeaveModule {}
