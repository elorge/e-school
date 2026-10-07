// backend/src/modules/leads/leads.dto.ts
import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'DEMO_BOOKED', 'SIGNED_UP', 'LOST'] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class UpdateLeadStatusDto {
  @IsIn(LEAD_STATUSES as unknown as string[])
  status!: LeadStatusValue;
}

export class AddLeadNoteDto {
  @trim() @IsString() @MinLength(1) @MaxLength(1000)
  text!: string;
}
