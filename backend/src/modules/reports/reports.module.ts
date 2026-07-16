// backend/src/modules/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PinsModule } from '../pins/pins.module';

@Module({
  imports: [HttpModule.register({ timeout: 8000 }), PinsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}