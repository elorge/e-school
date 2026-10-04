import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIdCardRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class ReviewIdCardRequestDto {
  @IsBoolean()
  approve!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reviewNote?: string;
}
