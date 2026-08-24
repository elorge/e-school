// backend/src/modules/terms/dto/create-term.dto.ts
import { IsDateString, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateTermDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(4)
  academicSession!: string; // e.g. "2025/2026"

  // Was locked to exactly [1, 2, 3] — Nigeria's 3-term system baked into
  // validation. A school running 2 semesters, 3 trimesters, or 4 quarters
  // all just need an ordering/uniqueness key within their academic
  // session; nothing downstream (report charts, Session Wrap ordering)
  // assumes exactly 3. @@unique([schoolId, academicSession, termNumber])
  // on the Term model still prevents duplicates regardless of the count
  // a school actually uses. 6 is a generous ceiling, not a real limit —
  // raise it further if a school genuinely needs more periods per session.
  @IsInt()
  @Min(1)
  @Max(6)
  termNumber!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}