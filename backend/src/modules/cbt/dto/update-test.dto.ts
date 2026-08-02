// backend/src/modules/cbt/dto/update-test.dto.ts
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Deliberately narrow. Scoring-affecting fields (theoryMaxScore, subject,
 * componentName, countsTowardReport) and durationMinutes are NOT here —
 * once a test is PUBLISHED, those are baked into objectiveMaxScore and
 * already-synced ResultEntry rows (see syncScoreToResult), and duration
 * drives deadlineAt for attempts already in progress. Editing them post-
 * publish would silently desync report cards or move a live exam's
 * deadline out from under a student. The service enforces the same
 * restriction server-side — this DTO just keeps the wire shape honest.
 */
export class UpdateTestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;
}