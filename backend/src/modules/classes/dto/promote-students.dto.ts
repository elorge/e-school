// backend/src/modules/classes/dto/promote-students.dto.ts
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class PromoteStudentsDto {
  @IsUUID()
  toClassId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  studentIds!: string[];
}