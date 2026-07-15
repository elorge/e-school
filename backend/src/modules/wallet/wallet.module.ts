// backend/src/modules/wallet/wallet.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletAdminController } from './wallet-admin.controller';
import { SchoolsModule } from '../schools/schools.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => SchoolsModule), EmailModule, NotificationsModule],
  providers: [WalletService],
  controllers: [WalletController, WalletAdminController],
  exports: [WalletService],
})
export class WalletModule {}