// backend/src/modules/cbt/dto/update-question.dto.ts
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  questionText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  options?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correctOptionIndex?: number;

  @IsOptional()
  @IsString()
  starterHtml?: string;

  @IsOptional()
  @IsString()
  starterCss?: string;

  @IsOptional()
  @IsString()
  starterJs?: string;

  @IsOptional()
  @IsArray()
  testAssertions?: { description: string; assertion: string }[];

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;
}