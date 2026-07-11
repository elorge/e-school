// backend/src/modules/email/brevo.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface SendTransactionalEmailInput {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  /** Optional plain-text fallback; Brevo will auto-generate one if omitted. */
  textContent?: string;
  tags?: string[];
}

/**
 * Thin wrapper around Brevo's transactional email API
 * (https://api.brevo.com/v3/smtp/email). Kept separate from EmailService
 * so the HTTP/provider concern is isolated from "what email do we send
 * when X happens" business logic.
 *
 * Email delivery failures are logged, never thrown — a Brevo outage
 * should never roll back a school onboarding, a wallet credit, or a PIN
 * generation. Callers that need delivery guarantees should read the
 * returned boolean and handle retries/alerting themselves.
 */
@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL ?? 'hello@elorgeschools.com';
  private readonly senderName = process.env.BREVO_SENDER_NAME ?? 'Elorge Schools';

  constructor(private readonly http: HttpService) {}

  async send(input: SendTransactionalEmailInput): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(`BREVO_API_KEY is not set — skipping email "${input.subject}" to ${input.to.map((r) => r.email).join(', ')}`);
      return false;
    }

    try {
      await firstValueFrom(
        this.http.post(
          this.apiUrl,
          {
            sender: { email: this.senderEmail, name: this.senderName },
            to: input.to,
            subject: input.subject,
            htmlContent: input.htmlContent,
            textContent: input.textContent,
            tags: input.tags,
          },
          {
            headers: {
              'api-key': this.apiKey,
              'content-type': 'application/json',
              accept: 'application/json',
            },
          },
        ),
      );
      return true;
    } catch (err) {
      const error = err as AxiosError;
      this.logger.error(
        `Brevo send failed for "${input.subject}" to ${input.to.map((r) => r.email).join(', ')}: ${
          error.response ? JSON.stringify(error.response.data) : error.message
        }`,
      );
      return false;
    }
  }
}
