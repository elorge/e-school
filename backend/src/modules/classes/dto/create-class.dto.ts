// backend/src/modules/classes/dto/create-class.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MinLength(1)
  name!: string;
}