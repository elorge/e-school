// backend/src/modules/staff/dto/create-staff-profile.dto.ts
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EmploymentType } from '@prisma/client';

export interface SalaryLineItem {
  name: string;
  amountKobo: number;
}

/**
 * Attaches an HR profile to a User row that already exists (created via
 * the existing auth invite/create-user flow — see AuthService.inviteStaff
 * / createUser). We never create the login account here: account
 * creation and HR onboarding are separate concerns, same as
 * Student.createdByStaffId doesn't create a User either.
 */
export class CreateStaffProfileDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsDateString()
  dateOfEmployment?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  baseSalaryKobo?: number;

  // Not deeply validated item-by-item — same looseness the codebase
  // already accepts for other free-form JSON arrays (e.g.
  // AddQuestionDto.testAssertions). Each item is expected to be
  // { name: string, amountKobo: number }.
  @IsOptional()
  @IsArray()
  allowances?: SalaryLineItem[];

  @IsOptional()
  @IsArray()
  deductions?: SalaryLineItem[];

  // Only ever honoured when the actor is a SCHOOL_ADMIN — see
  // StaffService.createProfile, which strips this field for anyone else
  // (an HR-flagged STAFF caller included) so HR access can only ever be
  // granted by a real admin, never self-granted or peer-granted.
  @IsOptional()
  @IsBoolean()
  isHrManager?: boolean;
}
