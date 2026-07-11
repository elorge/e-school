// backend/src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule, HttpModule.register({ timeout: 8000 })],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}