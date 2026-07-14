// backend/src/modules/auth/dto/invite-staff.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class InviteStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;
}