// backend/src/modules/cbt/cbt.module.ts
import { Module } from '@nestjs/common';
import { CbtService } from './cbt.service';
import { CbtController } from './cbt.controller';
import { WalletModule } from '../wallet/wallet.module';
import { ResultsModule } from '../results/results.module';
import { SchoolsModule } from '../schools/schools.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { MathRendererService } from '../../common/services/math-renderer.service';

@Module({
  imports: [WalletModule, ResultsModule, SchoolsModule, AssessmentModule],
  providers: [CbtService, MathRendererService],
  controllers: [CbtController],
})
export class CbtModule {}