// backend/src/modules/email/email.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BrevoService } from './brevo.service';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  providers: [BrevoService, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
