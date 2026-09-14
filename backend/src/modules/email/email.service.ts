// backend/src/modules/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import * as templates from './email.templates';
import { formatMoney } from '../../common/utils/currency.util';

/**
 * Business-facing email API. Every "we should notify someone" moment in
 * the app (school onboarding, staff accounts, wallet events, PIN
 * generation, password resets) goes through one method here — this is
 * the single place that knows which template maps to which event, so
 * copy changes never touch module services directly.
 *
 * All money-carrying methods now take a `currency` param — the caller
 * (WalletService, PinsService, SchoolsService) is responsible for
 * knowing which school this concerns and passing its `currency` through.
 * Formatting itself (symbol, decimal places, thousands separators) is
 * delegated entirely to formatMoney — this file never assumes Naira.
 *
 * Every method also takes an optional `locale` param, same pattern as
 * `currency` — the caller passes the relevant school's `locale` through.
 * Omitting it defaults the email to English (see resolveLocale in
 * email.templates.ts), so callers that haven't been updated yet keep
 * working exactly as before.
 *
 * All methods are fire-and-forget from the caller's perspective: they
 * never throw. A failed send is logged inside BrevoService and returns
 * false; callers may ignore the return value unless they specifically
 * want to surface delivery failures.
 */
@Injectable()
export class EmailService {
  constructor(private readonly brevo: BrevoService) {}

  async sendSchoolWelcome(params: {
    toEmail: string;
    toName: string;
    schoolName: string;
    slug: string;
    welcomeBonusKobo: number;
    currency: string;
    locale?: string;
  }) {
    const { subject, html } = templates.schoolWelcomeEmail({
      schoolName: params.schoolName,
      slug: params.slug,
      welcomeBonusFormatted: formatMoney(params.welcomeBonusKobo, params.currency),
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['onboarding'],
    });
  }

  async sendStaffAccountCreated(params: { toEmail: string; fullName: string; schoolName: string; role: string; locale?: string }) {
    const { subject, html } = templates.staffAccountCreatedEmail({
      fullName: params.fullName,
      schoolName: params.schoolName,
      role: params.role,
      loginEmail: params.toEmail,
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.fullName }],
      subject,
      htmlContent: html,
      tags: ['onboarding', 'staff'],
    });
  }

  async sendWalletCreditConfirmed(params: {
    toEmail: string;
    toName: string;
    schoolName: string;
    amountKobo: number;
    newBalanceKobo: number;
    source: string;
    currency: string;
    locale?: string;
  }) {
    const { subject, html } = templates.walletCreditConfirmedEmail({
      schoolName: params.schoolName,
      amountFormatted: formatMoney(params.amountKobo, params.currency),
      newBalanceFormatted: formatMoney(params.newBalanceKobo, params.currency),
      source: params.source,
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['wallet'],
    });
  }

  async sendManualTransferSubmitted(params: {
    toEmail: string;
    toName: string;
    schoolName: string;
    amountKobo: number;
    reference: string;
    currency: string;
    locale?: string;
  }) {
    const { subject, html } = templates.manualTransferSubmittedEmail({
      schoolName: params.schoolName,
      amountFormatted: formatMoney(params.amountKobo, params.currency),
      reference: params.reference,
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['wallet'],
    });
  }

  async sendManualTransferResolved(params: {
    toEmail: string;
    toName: string;
    schoolName: string;
    amountKobo: number;
    approved: boolean;
    reference: string;
    currency: string;
    locale?: string;
  }) {
    const { subject, html } = templates.manualTransferResolvedEmail({
      schoolName: params.schoolName,
      amountFormatted: formatMoney(params.amountKobo, params.currency),
      approved: params.approved,
      reference: params.reference,
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['wallet'],
    });
  }

  async sendPinsGenerated(params: {
    toEmail: string;
    toName: string;
    schoolName: string;
    termName: string;
    studentCount: number;
    totalCostKobo: number;
    currency: string;
    locale?: string;
  }) {
    const { subject, html } = templates.pinsGeneratedEmail({
      schoolName: params.schoolName,
      termName: params.termName,
      studentCount: params.studentCount,
      totalCostFormatted: formatMoney(params.totalCostKobo, params.currency),
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['pins'],
    });
  }

  async sendLowBalanceWarning(params: { toEmail: string; toName: string; schoolName: string; balanceKobo: number; currency: string; locale?: string }) {
    const { subject, html } = templates.lowBalanceWarningEmail({
      schoolName: params.schoolName,
      balanceFormatted: formatMoney(params.balanceKobo, params.currency),
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['wallet', 'low-balance'],
    });
  }

  async sendStaffInvite(params: { toEmail: string; fullName: string; schoolName: string; activateUrl: string; locale?: string }) {
    const { subject, html } = templates.staffInviteEmail({
      schoolName: params.schoolName,
      fullName: params.fullName,
      activateUrl: params.activateUrl,
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.fullName }],
      subject,
      htmlContent: html,
      tags: ['onboarding', 'staff', 'invite'],
    });
  }

  async sendPasswordReset(params: { toEmail: string; fullName: string; resetUrl: string; locale?: string }) {
    const { subject, html } = templates.passwordResetEmail({
      fullName: params.fullName,
      resetUrl: params.resetUrl,
      locale: params.locale,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.fullName }],
      subject,
      htmlContent: html,
      tags: ['auth', 'password-reset'],
    });
  }
}
