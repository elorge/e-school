// backend/src/modules/analytics/analytics.controller.ts
import { Body, Controller, Get, Headers, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './analytics.dto';

/** Public, cookie-free event intake for the marketing site. */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Public()
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @HttpCode(204)
  @Post('event')
  async event(@Body() dto: TrackEventDto, @Headers('user-agent') ua?: string) {
    await this.analytics.track(dto, ua);
  }
}

@UseGuards(RolesGuard)
@Controller('platform/analytics')
export class AnalyticsAdminController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  summary(@Query('days') days?: string) {
    return this.analytics.summary(parseInt(days ?? '30', 10) || 30);
  }
}
