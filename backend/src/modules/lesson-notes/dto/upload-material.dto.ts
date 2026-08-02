// backend/src/modules/lesson-notes/dto/upload-material.dto.ts
import { IsString, MinLength } from 'class-validator';

export class UploadMaterialDto {
  @IsString()
  @MinLength(1)
  insertAfter!: string; // "start" | "objectives" | "previousKnowledge" | "evaluation" | "assignment" | "summary" | "end"
}