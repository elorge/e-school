// backend/src/modules/calendar/calendar.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  providers: [CalendarService],
  controllers: [CalendarController],
})
export class CalendarModule {}