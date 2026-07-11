// backend/src/modules/cbt/dto/add-question.dto.ts
import { ArrayMinSize, IsArray, IsInt, IsString, Min, MinLength } from 'class-validator';

export class AddQuestionDto {
  @IsString()
  @MinLength(1)
  questionText!: string;

  @IsArray()
  @ArrayMinSize(2)
  options!: string[];

  @IsInt()
  @Min(0)
  correctOptionIndex!: number;

  @IsInt()
  @Min(1)
  points!: number;
}