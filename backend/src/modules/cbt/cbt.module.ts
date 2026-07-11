// backend/src/modules/cbt/cbt.module.ts
import { Module } from '@nestjs/common';
import { CbtService } from './cbt.service';
import { CbtController } from './cbt.controller';
import { WalletModule } from '../wallet/wallet.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [WalletModule, ResultsModule],
  providers: [CbtService],
  controllers: [CbtController],
})
export class CbtModule {}