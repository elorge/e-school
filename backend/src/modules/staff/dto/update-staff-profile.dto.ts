// backend/src/modules/staff/dto/update-staff-profile.dto.ts
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { EmploymentType, EmploymentStatus } from '@prisma/client';
import { SalaryLineItem } from './create-staff-profile.dto';

export class UpdateStaffProfileDto {
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
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

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

  @IsOptional()
  @IsArray()
  allowances?: SalaryLineItem[];

  @IsOptional()
  @IsArray()
  deductions?: SalaryLineItem[];
}
