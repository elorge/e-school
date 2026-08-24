// backend/src/modules/payments/dto/initialize-payment.dto.ts
import { IsEmail, IsInt, Min } from 'class-validator';

// `provider` removed — Flutterwave is the only gateway this platform
// integrates with now. If you ever add a second gateway back, reintroduce
// the field rather than assuming Flutterwave everywhere in PaymentsService.
export class InitializePaymentDto {
  @IsInt()
  @Min(100) // smallest sane charge in minor units across supported currencies
  amountKobo!: number;

  @IsEmail()
  payerEmail!: string;
}