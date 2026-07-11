// backend/src/modules/insights/insights.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { PinsModule } from '../pins/pins.module';
import { SchoolsModule } from '../schools/schools.module';

@Module({
  imports: [HttpModule.register({ timeout: 8000 }), PinsModule, SchoolsModule],
  providers: [InsightsService],
  controllers: [InsightsController],
})
export class InsightsModule {}