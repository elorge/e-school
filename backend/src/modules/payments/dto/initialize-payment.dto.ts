// backend/src/modules/payments/dto/initialize-payment.dto.ts
import { IsEmail, IsIn, IsInt, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsInt()
  @Min(100) // 1 Naira minimum, in kobo
  amountKobo!: number;

  @IsIn(['paystack', 'flutterwave'])
  provider!: 'paystack' | 'flutterwave';

  @IsEmail()
  payerEmail!: string;
}