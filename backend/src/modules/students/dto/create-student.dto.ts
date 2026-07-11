// backend/src/modules/students/dto/create-student.dto.ts
import { IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsUUID()
  classId!: string;

  // Generated on-device at the moment the teacher hits "register" — the
  // SAME value is sent on every retry of this specific registration, so
  // the server can recognize "I've already created this student" instead
  // of creating a duplicate.
  @IsUUID()
  clientReferenceId!: string;

  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  admissionYear!: number;
}