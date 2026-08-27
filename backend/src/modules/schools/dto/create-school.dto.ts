// backend/src/modules/schools/dto/create-school.dto.ts
import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../../common/utils/currency.util';

export class CreateSchoolDto {
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, hyphen-separated (e.g. "greenwood-college")',
  })
  slug!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @Matches(/^[A-Z0-9]{2,10}$/, { message: 'code must be 2-10 uppercase letters/digits (e.g. "GRW")' })
  code!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  // NEW: which country/currency this school operates in. Not optional —
  // every school needs both to price correctly and charge through
  // Flutterwave. See currency.util.ts for what's actually supported.
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode must be an ISO 3166-1 alpha-2 code, e.g. "NG"' })
  countryCode!: string;

  @IsIn(SUPPORTED_CURRENCIES, { message: `currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` })
  currency!: string;

  // Optional — defaults to the country's usual timezone (timezoneForCountry)
  // if omitted. Only needs setting explicitly for a school whose actual
  // campus doesn't match its country's default zone (e.g. a country
  // spanning multiple timezones). Drives CBT access-code day validity.
  @IsOptional()
  @IsString()
  timezone?: string;

  // NEW: the school's first SCHOOL_ADMIN. SchoolsController.create wires
  // this into both School creation (for the welcome email) and
  // AuthService.createUser (for the actual login-capable account).
  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(1)
  adminName!: string;

  @IsString()
  @MinLength(8)
  adminPassword!: string;
}