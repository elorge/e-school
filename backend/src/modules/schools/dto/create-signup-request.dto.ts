// backend/src/modules/schools/dto/create-signup-request.dto.ts
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

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