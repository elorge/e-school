// backend/src/modules/assessment/assessment.module.ts
import { Module } from '@nestjs/common';
import { AssessmentScoringService } from './assessment-scoring.service';
import { AssessmentController } from './assessment.controller';

@Module({
  providers: [AssessmentScoringService],
  controllers: [AssessmentController],
  exports: [AssessmentScoringService],
})
export class AssessmentModule {}