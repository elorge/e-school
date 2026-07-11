// backend/src/modules/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import * as templates from './email.templates';

const koboToNaira = (kobo: number) => Math.round(kobo) / 100;

/**
 * Business-facing email API. Every "we should notify someone" moment in
 * the app (school onboarding, staff accounts, wallet events, PIN
 * generation, password resets) goes through one method here — this is
 * the single place that knows which template maps to which event, so
 * copy changes never touch module services directly.
 *
 * All methods are fire-and-forget from the caller's perspective: they
 * never throw. A failed send is logged inside BrevoService and returns
 * false; callers may ignore the return value unless they specifically
 * want to surface delivery failures.
 */
@Injectable()
export class EmailService {
  constructor(private readonly brevo: BrevoService) {}

  async sendSchoolWelcome(params: { toEmail: string; toName: string; schoolName: string; slug: string; welcomeBonusKobo: number }) {
    const { subject, html } = templates.schoolWelcomeEmail({
      schoolName: params.schoolName,
      slug: params.slug,
      welcomeBonusNaira: koboToNaira(params.welcomeBonusKobo),
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['onboarding'],
    });
  }

  async sendStaffAccountCreated(params: { toEmail: string; fullName: string; schoolName: string; role: string }) {
    const { subject, html } = templates.staffAccountCreatedEmail({
      fullName: params.fullName,
      schoolName: params.schoolName,
      role: params.role,
      loginEmail: params.toEmail,
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
  }) {
    const { subject, html } = templates.walletCreditConfirmedEmail({
      schoolName: params.schoolName,
      amountNaira: koboToNaira(params.amountKobo),
      newBalanceNaira: koboToNaira(params.newBalanceKobo),
      source: params.source,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['wallet'],
    });
  }

  async sendManualTransferSubmitted(params: { toEmail: string; toName: string; schoolName: string; amountKobo: number; reference: string }) {
    const { subject, html } = templates.manualTransferSubmittedEmail({
      schoolName: params.schoolName,
      amountNaira: koboToNaira(params.amountKobo),
      reference: params.reference,
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
  }) {
    const { subject, html } = templates.manualTransferResolvedEmail({
      schoolName: params.schoolName,
      amountNaira: koboToNaira(params.amountKobo),
      approved: params.approved,
      reference: params.reference,
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
  }) {
    const { subject, html } = templates.pinsGeneratedEmail({
      schoolName: params.schoolName,
      termName: params.termName,
      studentCount: params.studentCount,
      totalCostNaira: koboToNaira(params.totalCostKobo),
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['pins'],
    });
  }

  async sendLowBalanceWarning(params: { toEmail: string; toName: string; schoolName: string; balanceKobo: number }) {
    const { subject, html } = templates.lowBalanceWarningEmail({
      schoolName: params.schoolName,
      balanceNaira: koboToNaira(params.balanceKobo),
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.toName }],
      subject,
      htmlContent: html,
      tags: ['wallet', 'low-balance'],
    });
  }

  async sendPasswordReset(params: { toEmail: string; fullName: string; resetUrl: string }) {
    const { subject, html } = templates.passwordResetEmail({
      fullName: params.fullName,
      resetUrl: params.resetUrl,
    });
    return this.brevo.send({
      to: [{ email: params.toEmail, name: params.fullName }],
      subject,
      htmlContent: html,
      tags: ['auth', 'password-reset'],
    });
  }
}
