// backend/src/modules/terms/dto/create-term.dto.ts
import { IsDateString, IsIn, IsInt, IsString, MinLength } from 'class-validator';

export class CreateTermDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(4)
  academicSession!: string; // e.g. "2025/2026"

  @IsInt()
  @IsIn([1, 2, 3])
  termNumber!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}