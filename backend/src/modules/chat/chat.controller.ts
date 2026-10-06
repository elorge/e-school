// backend/src/modules/chat/chat.controller.ts
import { Body, Controller, ForbiddenException, Get, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/roles.decorator';
import { ChatService } from './chat.service';
import { SendChatMessageDto, StartChatDto } from './chat.dto';

/** Public, unauthenticated endpoints used by the website chat widget. The visitor's secret `token` is sent in a header, never in the URL. */
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('start')
  start(@Body() dto: StartChatDto) {
    return this.chat.start(dto);
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('messages')
  send(@Headers('x-chat-token') token: string, @Body() dto: SendChatMessageDto) {
    return this.chat.send(token, dto.text);
  }

  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('messages')
  poll(@Headers('x-chat-token') token: string, @Query('after') after?: string) {
    return this.chat.poll(token, Math.max(0, parseInt(after ?? '0', 10) || 0));
  }
}

/** Telegram calls this when your team replies. Authenticated by the secret_token you registered with setWebhook. */
@Controller('webhooks/telegram')
export class TelegramWebhookController {
  constructor(private readonly chat: ChatService) {}

  @Public()
  @SkipThrottle()
  @HttpCode(200)
  @Post()
  async handle(@Headers('x-telegram-bot-api-secret-token') secret: string | undefined, @Body() update: any) {
    if (!this.chat.verifyWebhookSecret(secret)) throw new ForbiddenException();
    // Always answer 200 once authenticated — otherwise Telegram retries the same update for hours.
    await this.chat.handleTelegramUpdate(update).catch(() => undefined);
    return { ok: true };
  }
}
