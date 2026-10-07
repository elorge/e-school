// backend/src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BrevoService } from '../email/brevo.service';
import { ChatController, TelegramWebhookController } from './chat.controller';
import { ChatAdminController } from './chat-admin.controller';
import { DigestModule } from '../digest/digest.module';
import { ChatService } from './chat.service';

@Module({
  imports: [HttpModule.register({ timeout: 8000 }), DigestModule],
  controllers: [ChatController, TelegramWebhookController, ChatAdminController],
  providers: [ChatService, BrevoService],
})
export class ChatModule {}
