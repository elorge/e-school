// backend/src/modules/cbt/dto/create-test.dto.ts
import { IsInt, IsString, IsUUID, Min, MinLength } from 'class-validator';

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
}