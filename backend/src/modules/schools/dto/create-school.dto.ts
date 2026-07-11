// backend/src/modules/schools/dto/create-school.dto.ts
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

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