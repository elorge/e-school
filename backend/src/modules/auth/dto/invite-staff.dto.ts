// backend/src/modules/auth/dto/invite-staff.dto.ts
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class InviteStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;

  // A school should have two admins so one can approve the other's leave / ID card.
  @IsOptional()
  @IsIn(['STAFF', 'SCHOOL_ADMIN'])
  role?: 'STAFF' | 'SCHOOL_ADMIN';
}