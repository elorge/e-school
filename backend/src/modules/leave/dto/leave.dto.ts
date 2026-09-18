// backend/src/modules/leave/dto/leave.dto.ts
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultDaysPerYear?: number;
}

export class CreateLeaveRequestDto {
  @IsUUID()
  leaveTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewLeaveRequestDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
