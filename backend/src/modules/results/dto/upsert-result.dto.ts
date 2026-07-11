// backend/src/modules/results/dto/upsert-result.dto.ts
import { IsInt, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubjectScoreEntryDto {
  @IsString()
  subject!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;
}

export class UpsertResultDto {
  // Accepted as a plain map ({ "Mathematics": 78, ... }) — validated as a
  // non-empty object of subject -> 0-100 integer scores in the service
  // layer, since class-validator doesn't have a clean built-in for
  // "map of string to number".
  @IsObject()
  subjectScores!: Record<string, number>;

  @IsOptional()
  @IsString()
  teacherComment?: string;
}

// Exported for reuse if a future endpoint wants a strict array shape
// instead of the map shape above.
export { SubjectScoreEntryDto };