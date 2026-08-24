// backend/src/modules/schools/dto/create-signup-request.dto.ts
import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../../common/utils/currency.util';

export class CreateSignupRequestDto {
  @IsString()
  @MinLength(2)
  schoolName!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'slug must be lowercase, alphanumeric, hyphen-separated' })
  slug!: string;

  @IsString()
  @Matches(/^[A-Z0-9]{2,10}$/, { message: 'code must be 2-10 uppercase letters/digits' })
  code!: string;

  // NEW: collected on the public signup form (country picker + the
  // currency it implies) — carried through to the real School row when
  // a SUPER_ADMIN approves the request.
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode must be an ISO 3166-1 alpha-2 code, e.g. "NG"' })
  countryCode!: string;

  @IsIn(SUPPORTED_CURRENCIES, { message: `currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` })
  currency!: string;

  @IsString()
  @MinLength(1)
  adminName!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(8)
  adminPassword!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}