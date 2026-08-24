// backend/src/modules/career-fields/career-fields.module.ts
import { Module } from '@nestjs/common';
import { CareerFieldsService } from './career-fields.service';
import { CareerFieldsController } from './career-fields.controller';

@Module({
  providers: [CareerFieldsService],
  controllers: [CareerFieldsController],
  exports: [CareerFieldsService], // InsightsModule imports this to build Session Wrap's suggested fields
})
export class CareerFieldsModule {}