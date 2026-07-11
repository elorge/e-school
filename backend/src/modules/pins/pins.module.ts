// backend/src/modules/pins/pins.module.ts
import { Module } from '@nestjs/common';
import { PinsService } from './pins.service';
import { PinsController } from './pins.controller';
import { WalletModule } from '../wallet/wallet.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [WalletModule, EmailModule],
  providers: [PinsService],
  controllers: [PinsController],
  exports: [PinsService],
})
export class PinsModule {}