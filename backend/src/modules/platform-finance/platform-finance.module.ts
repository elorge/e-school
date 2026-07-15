// backend/src/modules/platform-finance/platform-finance.module.ts
import { Module } from '@nestjs/common';
import { PlatformFinanceService } from './platform-finance.service';
import { PlatformFinanceController } from './platform-finance.controller';

@Module({ providers: [PlatformFinanceService], controllers: [PlatformFinanceController] })
export class PlatformFinanceModule {}