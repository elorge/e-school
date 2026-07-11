// backend/src/modules/fees/fees.module.ts
import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';

@Module({ providers: [FeesService], controllers: [FeesController] })
export class FeesModule {}