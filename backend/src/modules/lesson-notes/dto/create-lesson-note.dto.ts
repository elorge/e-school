// backend/src/modules/lesson-notes/dto/create-lesson-note.dto.ts
import { IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateLessonNoteDto {
  @IsUUID()
  classId!: string;

  @IsUUID()
  termId!: string;

  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  topic!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsString()
  objectives!: string;

  @IsOptional()
  @IsString()
  instructionalMaterials?: string;

  @IsOptional()
  @IsString()
  previousKnowledge?: string;

  @IsString()
  @MinLength(1)
  presentation!: string;

  @IsOptional()
  @IsString()
  evaluation?: string;

  @IsOptional()
  @IsString()
  assignment?: string;

  @IsOptional()
  @IsString()
  summary?: string;
}
