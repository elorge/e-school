// backend/src/modules/email/email.templates.ts
/**
 * Deliberately plain, inline-styled HTML — no build step, renders
 * consistently across email clients. Each function returns { subject,
 * html }. Keep copy short; these are transactional notifications, not
 * marketing.
 */

const wrapper = (bodyHtml: string) => `
<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
  <div style="padding: 24px 0 8px;">
    <span style="font-size: 18px; font-weight: 700; color: #0b3d91;">Elorge</span><span style="font-size: 18px; font-weight: 700; color: #1f9d55;">Schools</span>
  </div>
  ${bodyHtml}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #777;">
    Elorge Technologies Limited — Software Development • IT Infrastructure<br />
    This is an automated message, please do not reply directly to this email.
  </div>
</div>`;

export function schoolWelcomeEmail(params: { schoolName: string; slug: string; welcomeBonusNaira: number }) {
  return {
    subject: `Welcome to Elorge Schools, ${params.schoolName}!`,
    html: wrapper(`
      <h2 style="font-size: 20px;">Your school is live 🎉</h2>
      <p><strong>${params.schoolName}</strong> has been onboarded onto Elorge Schools.</p>
      <p>We've credited your wallet with a one-time welcome bonus of
        <strong>₦${params.welcomeBonusNaira.toLocaleString('en-NG')}</strong> — enough to try a full term,
        completely free.</p>
      <p>Your school workspace: <strong>${params.slug}</strong></p>
      <p>Next steps: create staff accounts, register your classes and students, and you're ready to go — even offline.</p>
    `),
  };
}

export function staffAccountCreatedEmail(params: { fullName: string; schoolName: string; role: string; loginEmail: string }) {
  return {
    subject: `Your Elorge Schools account is ready`,
    html: wrapper(`
      <h2 style="font-size: 20px;">Hi ${params.fullName},</h2>
      <p>An account has been created for you at <strong>${params.schoolName}</strong> on Elorge Schools, with the role
        <strong>${params.role.replace('_', ' ')}</strong>.</p>
      <p>Sign in using: <strong>${params.loginEmail}</strong></p>
      <p>If you weren't expecting this, please contact your school administrator.</p>
    `),
  };
}

export function walletCreditConfirmedEmail(params: { schoolName: string; amountNaira: number; newBalanceNaira: number; source: string }) {
  return {
    subject: `Wallet credited — ₦${params.amountNaira.toLocaleString('en-NG')}`,
    html: wrapper(`
      <h2 style="font-size: 20px;">Payment confirmed</h2>
      <p><strong>${params.schoolName}</strong>'s wallet has been credited with
        <strong>₦${params.amountNaira.toLocaleString('en-NG')}</strong> (${params.source}).</p>
      <p>New wallet balance: <strong>₦${params.newBalanceNaira.toLocaleString('en-NG')}</strong></p>
    `),
  };
}

export function manualTransferSubmittedEmail(params: { schoolName: string; amountNaira: number; reference: string }) {
  return {
    subject: `Bank transfer received — pending review`,
    html: wrapper(`
      <h2 style="font-size: 20px;">Transfer claim submitted</h2>
      <p>We've received a manual bank transfer claim of
        <strong>₦${params.amountNaira.toLocaleString('en-NG')}</strong> for <strong>${params.schoolName}</strong>.</p>
      <p>Reference: <strong>${params.reference}</strong></p>
      <p>Our finance team will review and confirm this shortly. Your wallet will be credited once approved.</p>
    `),
  };
}

export function manualTransferResolvedEmail(params: { schoolName: string; amountNaira: number; approved: boolean; reference: string }) {
  return {
    subject: params.approved ? `Transfer approved — ₦${params.amountNaira.toLocaleString('en-NG')} credited` : `Transfer claim rejected`,
    html: wrapper(`
      <h2 style="font-size: 20px;">${params.approved ? 'Transfer approved' : 'Transfer rejected'}</h2>
      <p>Your bank transfer claim of <strong>₦${params.amountNaira.toLocaleString('en-NG')}</strong>
        (ref: ${params.reference}) for <strong>${params.schoolName}</strong> has been
        <strong>${params.approved ? 'approved and credited to your wallet' : 'rejected'}</strong>.</p>
      ${params.approved ? '' : '<p>If you believe this is a mistake, please contact support with your transfer receipt.</p>'}
    `),
  };
}

export function pinsGeneratedEmail(params: { schoolName: string; termName: string; studentCount: number; totalCostNaira: number }) {
  return {
    subject: `Result PINs generated for ${params.termName}`,
    html: wrapper(`
      <h2 style="font-size: 20px;">PINs generated</h2>
      <p><strong>${params.studentCount}</strong> result PIN(s) were generated for <strong>${params.schoolName}</strong>
        — ${params.termName} — at a total cost of <strong>₦${params.totalCostNaira.toLocaleString('en-NG')}</strong>.</p>
      <p>Download the PIN sheet from your dashboard to share Admission IDs and PINs with students. For security,
        PINs are shown once and never emailed in plaintext.</p>
    `),
  };
}

export function lowBalanceWarningEmail(params: { schoolName: string; balanceNaira: number }) {
  return {
    subject: `Low wallet balance — ${params.schoolName}`,
    html: wrapper(`
      <h2 style="font-size: 20px;">Your wallet balance is low</h2>
      <p><strong>${params.schoolName}</strong>'s wallet balance is now
        <strong>₦${params.balanceNaira.toLocaleString('en-NG')}</strong>.</p>
      <p>Fund your wallet to keep generating result PINs without interruption.</p>
    `),
  };
}

export function passwordResetEmail(params: { fullName: string; resetUrl: string }) {
  return {
    subject: `Reset your Elorge Schools password`,
    html: wrapper(`
      <h2 style="font-size: 20px;">Hi ${params.fullName},</h2>
      <p>We received a request to reset your password. Click below to choose a new one — this link expires in
        30 minutes.</p>
      <p><a href="${params.resetUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}

