// backend/src/modules/cbt/dto/create-test.dto.ts
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, MinLength, IsBoolean } from 'class-validator';

export class CreateTestDto {
  @IsUUID()
  termId!: string;

  @IsUUID()
  classId!: string;

  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsInt()
  @Min(0)
  theoryMaxScore!: number; // 0 if objectives-only

  @IsDateString()
  scheduledDate!: string; // e.g. "2026-07-15" — the one day this test is meant to run

  @IsOptional()
  @IsInt()
  @Min(1)
  accessWindowMinutes?: number; // defaults server-side to durationMinutes + a grace buffer if omitted

  @IsOptional()
  @IsBoolean()
  countsTowardReport?: boolean;

  @IsOptional()
  @IsString()
  componentName?: string; // must match a Grading Weight name for the recomputed/weighted result path to pick it up
}