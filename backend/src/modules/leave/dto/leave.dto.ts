// backend/src/modules/leave/dto/leave.dto.ts
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, MaxLength, MinLength } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultDaysPerYear?: number;
}

export class UpdateLeaveTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultDaysPerYear?: number;
}

export class CreateLeaveRequestDto {
  // Either pick an existing type, or type a new one in leaveTypeName. Only the admin can rename/delete types.
  @IsOptional()
  @IsUUID()
  leaveTypeId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  leaveTypeName?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReviewLeaveRequestDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
