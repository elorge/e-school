// backend/src/modules/chat/chat.dto.ts
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export const CHAT_LOCALES = ['en', 'fr', 'pt', 'es'] as const;
export type ChatLocale = (typeof CHAT_LOCALES)[number];

export class StartChatDto {
  @trim() @IsString() @MinLength(2) @MaxLength(80)
  name!: string;

  // Email, phone and country are optional — validated only when the visitor filled them in.
  @trim() @ValidateIf((o) => !!o.email) @IsEmail() @MaxLength(160)
  email?: string;

  @trim() @ValidateIf((o) => !!o.phone) @IsString() @Matches(/^[+\d\s().-]{7,24}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @trim() @ValidateIf((o) => !!o.countryCode) @IsString() @Length(2, 2)
  countryCode?: string;

  @trim() @IsString() @MinLength(1) @MaxLength(1000)
  message!: string;

  @IsOptional() @IsIn(CHAT_LOCALES as unknown as string[])
  locale?: ChatLocale;

  @IsOptional() @trim() @IsString() @MaxLength(300)
  pageUrl?: string;

  /** Honeypot — real visitors never see or fill this field. */
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}

export class SendChatMessageDto {
  @trim() @IsString() @MinLength(1) @MaxLength(1000)
  text!: string;
}
