// backend/src/modules/analytics/analytics.dto.ts
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export const EVENT_NAMES = ['page_view', 'chat_started', 'signup_submitted', 'demo_requested'] as const;
export type EventName = (typeof EVENT_NAMES)[number];

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class TrackEventDto {
  @IsIn(EVENT_NAMES as unknown as string[])
  name!: EventName;

  @trim() @IsString() @MaxLength(200) @Matches(/^\//, { message: 'path must start with /' })
  path!: string;

  @IsString() @Matches(/^[a-zA-Z0-9-]{8,64}$/)
  sessionId!: string;

  @IsOptional() @trim() @IsString() @MaxLength(100)
  referrer?: string;

  @IsOptional() @trim() @IsString() @MaxLength(80)
  utmSource?: string;

  @IsOptional() @trim() @IsString() @MaxLength(80)
  utmMedium?: string;

  @IsOptional() @trim() @IsString() @MaxLength(80)
  utmCampaign?: string;

  @IsOptional() @IsIn(['en', 'fr', 'pt', 'es'])
  locale?: string;

  @IsOptional() @IsIn(['mobile', 'desktop'])
  device?: string;
}
