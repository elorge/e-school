// backend/src/modules/staff/dto/update-my-staff-profile.dto.ts
import { IsDateString, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

/**
 * What a staff member may edit about THEMSELVES. Deliberately a separate,
 * narrow DTO (and ValidationPipe whitelist strips anything else) so a
 * staff caller can never touch pay, designation, department, employment
 * status/type, or start date — those stay with the school admin.
 *
 * An empty string clears the field.
 */
export class UpdateMyStaffProfileDto {
  @IsOptional()
  @ValidateIf((_o, v) => v !== '')
  @Matches(/^[+\d][\d\s-]{6,19}$/, { message: 'Enter a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  gender?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== '')
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  stateOfOrigin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  qualifications?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nextOfKinName?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== '')
  @Matches(/^[+\d][\d\s-]{6,19}$/, { message: 'Enter a valid next-of-kin phone number' })
  nextOfKinPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  nextOfKinRelationship?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankAccountName?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== '')
  @Matches(/^\d{6,20}$/, { message: 'Account number must be digits only' })
  bankAccountNumber?: string;
}
