// backend/src/modules/payments/payments.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { timingSafeEqual, randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { minorToMajor, majorToMinor } from '../../common/utils/currency.util';

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
   *
   * Charges in the SCHOOL'S OWN currency (school.currency), never a
   * hardcoded NGN — Flutterwave settles in whatever currency you pass
   * it, as long as that corridor is enabled on your account. amountKobo
   * is minor units of that currency (not literally kobo unless the
   * school's currency happens to be NGN).
   */
  async initialize(schoolId: string, amountKobo: number, payerEmail: string) {
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
    const reference = `flutterwave-${schoolId}-${randomUUID()}`;

    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) throw new BadRequestException('Flutterwave is not configured');

    const response = await firstValueFrom(
      this.http.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: reference,
          amount: minorToMajor(amountKobo, school.currency), // decimal-place-aware — was a blind /100 that assumed NGN
          currency: school.currency, // was hardcoded 'NGN'
          redirect_url: process.env.FRONTEND_PAYMENT_CALLBACK_URL,
          customer: { email: payerEmail },
          meta: { schoolId, schoolName: school.name },
        },
        { headers: { Authorization: `Bearer ${secret}` } },
      ),
    );
    return { redirectUrl: response.data.data.link, reference };
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
   * Assumes you pass schoolId through as `meta.schoolId` when you
   * initialize the charge from the frontend — cheapest way to avoid a
   * lookup table. Adjust if you initialize charges differently.
   */
  private async resolveSchoolId(candidateSchoolId: unknown): Promise<string | null> {
    if (typeof candidateSchoolId !== 'string') return null;
    const school = await this.prisma.school.findUnique({ where: { id: candidateSchoolId } });
    return school?.id ?? null;
  }

  async handleFlutterwaveEvent(payload: any) {
    if (payload.event !== 'charge.completed' || payload.data?.status !== 'successful') return;
    const data = payload.data;
    const schoolId = await this.resolveSchoolId(data?.meta?.schoolId);
    if (!schoolId) {
      this.logger.error(`Flutterwave charge.completed with unresolvable schoolId — tx ${data?.tx_ref}`);
      return;
    }

    // Flutterwave reports `amount` in major units of whatever currency
    // it charged in — convert back to minor units using THAT currency's
    // decimal places, not a blind *100 that assumed NGN. Also guard
    // against a currency mismatch: if the webhook's currency doesn't
    // match the school's on-file currency, something is wrong (stale
    // metadata, a manipulated request) — log loudly and skip crediting
    // rather than silently crediting the wrong amount.
    const school = await this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
    if (data.currency && data.currency !== school.currency) {
      this.logger.error(
        `Flutterwave charge.completed currency mismatch for school ${schoolId}: webhook says ${data.currency}, school is ${school.currency} — tx ${data?.tx_ref}`,
      );
      return;
    }

    const amountKobo = majorToMinor(data.amount, school.currency);
    await this.walletService.creditFromGateway(schoolId, amountKobo, `flutterwave-${data.tx_ref}`);
  }
}