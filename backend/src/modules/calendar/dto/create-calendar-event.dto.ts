// backend/src/modules/calendar/dto/create-calendar-event.dto.ts
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { CalendarEventType } from '@prisma/client';

export class CreateCalendarEventDto {
  @IsOptional()
  @IsUUID()
  termId?: string;

  @IsEnum(CalendarEventType)
  type!: CalendarEventType;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}