// backend/src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BrevoService } from '../email/brevo.service';
import { ChatController, TelegramWebhookController } from './chat.controller';
import { ChatAdminController } from './chat-admin.controller';
import { ChatService } from './chat.service';
import { TelegramService } from './telegram.service';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  controllers: [ChatController, TelegramWebhookController, ChatAdminController],
  providers: [ChatService, TelegramService, BrevoService],
})
export class ChatModule {}
