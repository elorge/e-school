// backend/src/modules/schools/dto/set-price-override.dto.ts
import { IsInt, IsOptional, Min } from 'class-validator';

export class SetPriceOverrideDto {
  // null clears the override (falls back to platform default)
  @IsOptional()
  @IsInt()
  @Min(0)
  pricePerStudentKobo?: number | null;
}