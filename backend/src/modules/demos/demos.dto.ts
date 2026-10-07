// backend/src/modules/demos/demos.dto.ts
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class RequestDemoDto {
  @trim() @IsString() @MinLength(2) @MaxLength(80)
  name!: string;

  @trim() @IsString() @MinLength(2) @MaxLength(120)
  schoolName!: string;

  @trim() @IsEmail() @MaxLength(160)
  email!: string;

  @trim() @ValidateIf((o) => !!o.phone) @IsString() @Matches(/^[+\d\s().-]{7,24}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @trim() @IsString() @Length(2, 2)
  countryCode!: string;

  @trim() @ValidateIf((o) => !!o.preferredDate) @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'preferredDate must be YYYY-MM-DD' })
  preferredDate?: string;

  @IsOptional() @IsIn(['morning', 'afternoon', 'evening'])
  timeOfDay?: string;

  @trim() @IsOptional() @IsString() @MaxLength(60)
  timezone?: string;

  @IsOptional() @IsIn(['<100', '100-500', '500-1000', '1000+'])
  studentCount?: string;

  @trim() @IsOptional() @IsString() @MaxLength(1000)
  message?: string;

  @IsOptional() @IsIn(['en', 'fr', 'pt', 'es'])
  locale?: string;

  /** Honeypot — real visitors never see or fill this field. */
  @IsOptional() @IsString() @MaxLength(200)
  website?: string;
}
