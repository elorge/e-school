// backend/src/modules/demos/demos.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BrevoService } from '../email/brevo.service';
import { DemosController } from './demos.controller';
import { DemosService } from './demos.service';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  controllers: [DemosController],
  providers: [DemosService, BrevoService],
})
export class DemosModule {}
