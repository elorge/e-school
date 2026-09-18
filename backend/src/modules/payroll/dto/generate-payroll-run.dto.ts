// backend/src/modules/payroll/dto/generate-payroll-run.dto.ts
import { IsDateString, IsString, MinLength } from 'class-validator';

export class GeneratePayrollRunDto {
  @IsString()
  @MinLength(1)
  periodLabel!: string; // e.g. "September 2026" — free text, school's own convention

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;
}
