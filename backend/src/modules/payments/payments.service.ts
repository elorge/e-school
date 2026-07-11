// backend/src/modules/payments/payments.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly http: HttpService,
  ) {}

  /**
   * Kicks off a charge and returns a redirect URL. The frontend sends
   * the user there; the provider redirects back to your success page
   * after payment, but the wallet is ONLY credited by the webhook
   * (below) — never trust the redirect itself, since a user can hit
   * "back" or close the tab before the webhook fires, or fake the
   * redirect entirely.
   */
  async initialize(schoolId: string, amountKobo: number, provider: 'paystack' | 'flutterwave', payerEmail: string) {
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
    const reference = `${provider}-${schoolId}-${randomUUID()}`;

    if (provider === 'paystack') {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) throw new BadRequestException('Paystack is not configured');
      const response = await firstValueFrom(
        this.http.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email: payerEmail,
            amount: amountKobo, // Paystack expects amount in kobo for NGN — matches our unit already
            reference,
            metadata: { schoolId, schoolName: school.name },
          },
          { headers: { Authorization: `Bearer ${secret}` } },
        ),
      );
      return { redirectUrl: response.data.data.authorization_url, reference };
    }

    // flutterwave
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) throw new BadRequestException('Flutterwave is not configured');
    const response = await firstValueFrom(
      this.http.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: reference,
          amount: amountKobo / 100, // Flutterwave expects Naira, not kobo
          currency: 'NGN',
          redirect_url: process.env.FRONTEND_PAYMENT_CALLBACK_URL,
          customer: { email: payerEmail },
          meta: { schoolId, schoolName: school.name },
        },
        { headers: { Authorization: `Bearer ${secret}` } },
      ),
    );
    return { redirectUrl: response.data.data.link, reference };
  }

  verifyPaystackSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret || !signatureHeader) return false;
    const computed = createHmac('sha512', secret).update(rawBody).digest('hex');
    const a = Buffer.from(computed);
    const b = Buffer.from(signatureHeader);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  verifyFlutterwaveSignature(verifHashHeader: string | undefined): boolean {
    // Flutterwave doesn't HMAC — it just echoes back the secret hash you
    // configured in their dashboard. Plain equality, still timing-safe.
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (!secret || !verifHashHeader) return false;
    const a = Buffer.from(secret);
    const b = Buffer.from(verifHashHeader);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /**
   * Resolves a gateway's customer/metadata reference back to a schoolId.
   * Assumes you pass schoolId through as `metadata.schoolId` (Paystack)
   * or `meta.schoolId` (Flutterwave) when you initialize the charge from
   * the frontend — cheapest way to avoid a lookup table. Adjust if you
   * initialize charges differently.
   */
  private async resolveSchoolId(candidateSchoolId: unknown): Promise<string | null> {
    if (typeof candidateSchoolId !== 'string') return null;
    const school = await this.prisma.school.findUnique({ where: { id: candidateSchoolId } });
    return school?.id ?? null;
  }

  async handlePaystackEvent(payload: any) {
    if (payload.event !== 'charge.success') return;
    const data = payload.data;
    const schoolId = await this.resolveSchoolId(data?.metadata?.schoolId);
    if (!schoolId) {
      this.logger.error(`Paystack charge.success with unresolvable schoolId — ref ${data?.reference}`);
      return;
    }
    // amountKobo: Paystack sends amount in kobo already for NGN — no conversion needed.
    await this.walletService.creditFromGateway(schoolId, data.amount, `paystack-${data.reference}`);
  }

  async handleFlutterwaveEvent(payload: any) {
    if (payload.event !== 'charge.completed' || payload.data?.status !== 'successful') return;
    const data = payload.data;
    const schoolId = await this.resolveSchoolId(data?.meta?.schoolId);
    if (!schoolId) {
      this.logger.error(`Flutterwave charge.completed with unresolvable schoolId — tx ${data?.tx_ref}`);
      return;
    }
    // Flutterwave sends amount in Naira, not kobo — convert.
    const amountKobo = Math.round(data.amount * 100);
    await this.walletService.creditFromGateway(schoolId, amountKobo, `flutterwave-${data.tx_ref}`);
  }
}