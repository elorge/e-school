// backend/src/modules/auth/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;

  @IsEnum(Role)
  role!: Role;

  // Only meaningful for SUPER_ADMIN callers creating platform-wide staff
  // (FINANCE_OPS/SUPER_ADMIN) directly. A SCHOOL_ADMIN's requests are
  // always pinned to their own school in the controller — see below.
  @IsOptional()
  @IsUUID()
  schoolId?: string;
}