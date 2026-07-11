// backend/src/modules/id-cards/id-cards.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdCardsService } from './id-cards.service';
import { IdCardsController } from './id-cards.controller';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  providers: [IdCardsService],
  controllers: [IdCardsController],
  exports: [IdCardsService],
})
export class IdCardsModule {}
