// backend/src/modules/subjects/dto/create-subject.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @MinLength(1)
  name!: string;
}