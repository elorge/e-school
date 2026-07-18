// backend/src/modules/cbt/dto/add-question.dto.ts
import { ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateIf } from 'class-validator';

export class AddQuestionDto {
  @IsIn(['OBJECTIVE', 'CODE'])
  type!: 'OBJECTIVE' | 'CODE';

  @IsString()
  @MinLength(1)
  questionText!: string;

  @ValidateIf((o) => o.type === 'OBJECTIVE')
  @IsArray()
  @ArrayMinSize(2)
  options?: string[];

  @ValidateIf((o) => o.type === 'OBJECTIVE')
  @IsInt()
  @Min(0)
  correctOptionIndex?: number;

  @ValidateIf((o) => o.type === 'CODE')
  @IsOptional()
  @IsString()
  starterHtml?: string;

  @ValidateIf((o) => o.type === 'CODE')
  @IsOptional()
  @IsString()
  starterCss?: string;

  @ValidateIf((o) => o.type === 'CODE')
  @IsOptional()
  @IsString()
  starterJs?: string;

  @ValidateIf((o) => o.type === 'CODE')
  @IsArray()
  testAssertions?: { description: string; assertion: string }[];

  @IsInt()
  @Min(1)
  points!: number;
}