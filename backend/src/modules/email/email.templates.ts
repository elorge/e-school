// backend/src/modules/email/email.templates.ts
/**
 * Deliberately plain, inline-styled HTML — no build step, renders
 * consistently across email clients. Each function returns { subject,
 * html }. Keep copy short; these are transactional notifications, not
 * marketing.
 *
 * Money is always passed in ALREADY FORMATTED (e.g. "₦12,000.00" or
 * "GH₵450") via EmailService's calls to formatMoney — these templates
 * never format currency themselves, so they never accidentally assume
 * Naira.
 *
 * Every function takes a `locale` param (defaults to 'en' if the caller
 * hasn't been updated yet — see EmailService) and picks a full EN, FR, or
 * PT copy block rather than swapping individual words, since these
 * languages aren't just each other with different nouns dropped in (word
 * order, agreement, etc. all differ). School names, amounts, and other
 * school-entered or pre-formatted values are never translated — only the
 * platform's own sentences around them.
 */
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale, isSupportedLocale } from '../../common/utils/locale.util';

const wrapper = (bodyHtml: string, footerHtml: string) => `
<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
  <div style="padding: 24px 0 8px;">
    <span style="font-size: 18px; font-weight: 700; color: #0b3d91;">Elorge</span><span style="font-size: 18px; font-weight: 700; color: #1f9d55;">Schools</span>
  </div>
  ${bodyHtml}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #777;">
    ${footerHtml}
  </div>
</div>`;

const FOOTER: Record<SupportedLocale, string> = {
  en: 'Elorge Technologies Limited — Software Development • IT Infrastructure<br />This is an automated message, please do not reply directly to this email.',
  fr: "Elorge Technologies Limited — Développement logiciel • Infrastructure informatique<br />Ceci est un message automatique, merci de ne pas y répondre directement.",
  pt: 'Elorge Technologies Limited — Desenvolvimento de Software • Infraestrutura de TI<br />Esta é uma mensagem automática, por favor não responda diretamente a este e-mail.',
};

function resolveLocale(locale?: string): SupportedLocale {
  return locale && isSupportedLocale(locale) ? locale : PLATFORM_DEFAULT_LOCALE;
}

export function schoolWelcomeEmail(params: { schoolName: string; slug: string; welcomeBonusFormatted: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Bienvenue sur Elorge Schools, ${params.schoolName} !`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Votre école est en ligne 🎉</h2>
        <p><strong>${params.schoolName}</strong> a été intégrée sur Elorge Schools.</p>
        <p>Nous avons crédité votre portefeuille d'un bonus de bienvenue unique de
          <strong>${params.welcomeBonusFormatted}</strong> — de quoi essayer un trimestre complet,
          entièrement gratuit.</p>
        <p>L'espace de votre école : <strong>${params.slug}</strong></p>
        <p>Prochaines étapes : créez des comptes pour votre personnel, enregistrez vos classes et élèves — vous êtes prêt, même hors ligne.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `Bem-vindo à Elorge Schools, ${params.schoolName}!`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">A sua escola está no ar 🎉</h2>
        <p><strong>${params.schoolName}</strong> foi integrada na Elorge Schools.</p>
        <p>Creditámos na sua carteira um bónus de boas-vindas único de
          <strong>${params.welcomeBonusFormatted}</strong> — suficiente para experimentar um trimestre completo,
          totalmente grátis.</p>
        <p>O espaço da sua escola: <strong>${params.slug}</strong></p>
        <p>Próximos passos: crie contas para o seu pessoal, registe as suas turmas e alunos — está tudo pronto, mesmo offline.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Welcome to Elorge Schools, ${params.schoolName}!`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Your school is live 🎉</h2>
      <p><strong>${params.schoolName}</strong> has been onboarded onto Elorge Schools.</p>
      <p>We've credited your wallet with a one-time welcome bonus of
        <strong>${params.welcomeBonusFormatted}</strong> — enough to try a full term,
        completely free.</p>
      <p>Your school workspace: <strong>${params.slug}</strong></p>
      <p>Next steps: create staff accounts, register your classes and students, and you're ready to go — even offline.</p>
    `,
      FOOTER.en,
    ),
  };
}

export function staffAccountCreatedEmail(params: { fullName: string; schoolName: string; role: string; loginEmail: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Votre compte Elorge Schools est prêt`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Bonjour ${params.fullName},</h2>
        <p>Un compte a été créé pour vous à <strong>${params.schoolName}</strong> sur Elorge Schools, avec le rôle
          <strong>${params.role.replace('_', ' ')}</strong>.</p>
        <p>Connectez-vous avec : <strong>${params.loginEmail}</strong></p>
        <p>Si vous ne vous attendiez pas à ce message, veuillez contacter l'administration de votre école.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `A sua conta Elorge Schools está pronta`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Olá ${params.fullName},</h2>
        <p>Foi criada uma conta para si em <strong>${params.schoolName}</strong> na Elorge Schools, com a função
          <strong>${params.role.replace('_', ' ')}</strong>.</p>
        <p>Inicie sessão com: <strong>${params.loginEmail}</strong></p>
        <p>Se não esperava esta mensagem, contacte a administração da sua escola.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Your Elorge Schools account is ready`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Hi ${params.fullName},</h2>
      <p>An account has been created for you at <strong>${params.schoolName}</strong> on Elorge Schools, with the role
        <strong>${params.role.replace('_', ' ')}</strong>.</p>
      <p>Sign in using: <strong>${params.loginEmail}</strong></p>
      <p>If you weren't expecting this, please contact your school administrator.</p>
    `,
      FOOTER.en,
    ),
  };
}

export function walletCreditConfirmedEmail(params: { schoolName: string; amountFormatted: string; newBalanceFormatted: string; source: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Portefeuille crédité — ${params.amountFormatted}`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Paiement confirmé</h2>
        <p>Le portefeuille de <strong>${params.schoolName}</strong> a été crédité de
          <strong>${params.amountFormatted}</strong> (${params.source}).</p>
        <p>Nouveau solde du portefeuille : <strong>${params.newBalanceFormatted}</strong></p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `Carteira creditada — ${params.amountFormatted}`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Pagamento confirmado</h2>
        <p>A carteira de <strong>${params.schoolName}</strong> foi creditada com
          <strong>${params.amountFormatted}</strong> (${params.source}).</p>
        <p>Novo saldo da carteira: <strong>${params.newBalanceFormatted}</strong></p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Wallet credited — ${params.amountFormatted}`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Payment confirmed</h2>
      <p><strong>${params.schoolName}</strong>'s wallet has been credited with
        <strong>${params.amountFormatted}</strong> (${params.source}).</p>
      <p>New wallet balance: <strong>${params.newBalanceFormatted}</strong></p>
    `,
      FOOTER.en,
    ),
  };
}

export function manualTransferSubmittedEmail(params: { schoolName: string; amountFormatted: string; reference: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Virement bancaire reçu — en attente de vérification`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Déclaration de virement soumise</h2>
        <p>Nous avons reçu une déclaration de virement bancaire de
          <strong>${params.amountFormatted}</strong> pour <strong>${params.schoolName}</strong>.</p>
        <p>Référence : <strong>${params.reference}</strong></p>
        <p>Notre équipe financière l'examinera et le confirmera prochainement. Votre portefeuille sera crédité une fois approuvé.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `Transferência bancária recebida — a aguardar verificação`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Declaração de transferência submetida</h2>
        <p>Recebemos uma declaração de transferência bancária de
          <strong>${params.amountFormatted}</strong> para <strong>${params.schoolName}</strong>.</p>
        <p>Referência: <strong>${params.reference}</strong></p>
        <p>A nossa equipa financeira irá analisá-la e confirmá-la em breve. A sua carteira será creditada assim que for aprovada.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Bank transfer received — pending review`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Transfer claim submitted</h2>
      <p>We've received a manual bank transfer claim of
        <strong>${params.amountFormatted}</strong> for <strong>${params.schoolName}</strong>.</p>
      <p>Reference: <strong>${params.reference}</strong></p>
      <p>Our finance team will review and confirm this shortly. Your wallet will be credited once approved.</p>
    `,
      FOOTER.en,
    ),
  };
}

export function manualTransferResolvedEmail(params: { schoolName: string; amountFormatted: string; approved: boolean; reference: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: params.approved ? `Virement approuvé — ${params.amountFormatted} crédité` : `Déclaration de virement rejetée`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">${params.approved ? 'Virement approuvé' : 'Virement rejeté'}</h2>
        <p>Votre déclaration de virement bancaire de <strong>${params.amountFormatted}</strong>
          (réf. : ${params.reference}) pour <strong>${params.schoolName}</strong> a été
          <strong>${params.approved ? 'approuvée et créditée sur votre portefeuille' : 'rejetée'}</strong>.</p>
        ${params.approved ? '' : "<p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support avec votre reçu de virement.</p>"}
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: params.approved ? `Transferência aprovada — ${params.amountFormatted} creditado` : `Declaração de transferência rejeitada`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">${params.approved ? 'Transferência aprovada' : 'Transferência rejeitada'}</h2>
        <p>A sua declaração de transferência bancária de <strong>${params.amountFormatted}</strong>
          (ref.: ${params.reference}) para <strong>${params.schoolName}</strong> foi
          <strong>${params.approved ? 'aprovada e creditada na sua carteira' : 'rejeitada'}</strong>.</p>
        ${params.approved ? '' : '<p>Se acredita que isto é um erro, contacte o suporte com o seu comprovativo de transferência.</p>'}
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: params.approved ? `Transfer approved — ${params.amountFormatted} credited` : `Transfer claim rejected`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">${params.approved ? 'Transfer approved' : 'Transfer rejected'}</h2>
      <p>Your bank transfer claim of <strong>${params.amountFormatted}</strong>
        (ref: ${params.reference}) for <strong>${params.schoolName}</strong> has been
        <strong>${params.approved ? 'approved and credited to your wallet' : 'rejected'}</strong>.</p>
      ${params.approved ? '' : '<p>If you believe this is a mistake, please contact support with your transfer receipt.</p>'}
    `,
      FOOTER.en,
    ),
  };
}

export function pinsGeneratedEmail(params: { schoolName: string; termName: string; studentCount: number; totalCostFormatted: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Codes PIN de résultats générés pour ${params.termName}`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Codes PIN générés</h2>
        <p><strong>${params.studentCount}</strong> code(s) PIN de résultat ont été générés pour <strong>${params.schoolName}</strong>
          — ${params.termName} — pour un coût total de <strong>${params.totalCostFormatted}</strong>.</p>
        <p>Téléchargez la feuille de PIN depuis votre tableau de bord pour partager les matricules et codes PIN avec les élèves.
          Pour des raisons de sécurité, les codes PIN sont affichés une seule fois et ne sont jamais envoyés en clair par e-mail.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `PINs de resultados gerados para ${params.termName}`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">PINs gerados</h2>
        <p><strong>${params.studentCount}</strong> PIN(s) de resultado foram gerados para <strong>${params.schoolName}</strong>
          — ${params.termName} — a um custo total de <strong>${params.totalCostFormatted}</strong>.</p>
        <p>Descarregue a folha de PINs no seu painel para partilhar os números de matrícula e PINs com os alunos.
          Por segurança, os PINs são apresentados apenas uma vez e nunca são enviados por e-mail em texto simples.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Result PINs generated for ${params.termName}`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">PINs generated</h2>
      <p><strong>${params.studentCount}</strong> result PIN(s) were generated for <strong>${params.schoolName}</strong>
        — ${params.termName} — at a total cost of <strong>${params.totalCostFormatted}</strong>.</p>
      <p>Download the PIN sheet from your dashboard to share Admission IDs and PINs with students. For security,
        PINs are shown once and never emailed in plaintext.</p>
    `,
      FOOTER.en,
    ),
  };
}

export function lowBalanceWarningEmail(params: { schoolName: string; balanceFormatted: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Solde du portefeuille faible — ${params.schoolName}`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Le solde de votre portefeuille est faible</h2>
        <p>Le solde du portefeuille de <strong>${params.schoolName}</strong> est maintenant de
          <strong>${params.balanceFormatted}</strong>.</p>
        <p>Rechargez votre portefeuille pour continuer à générer des codes PIN de résultats sans interruption.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `Saldo da carteira baixo — ${params.schoolName}`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">O saldo da sua carteira está baixo</h2>
        <p>O saldo da carteira de <strong>${params.schoolName}</strong> é agora de
          <strong>${params.balanceFormatted}</strong>.</p>
        <p>Carregue a sua carteira para continuar a gerar PINs de resultados sem interrupções.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Low wallet balance — ${params.schoolName}`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Your wallet balance is low</h2>
      <p><strong>${params.schoolName}</strong>'s wallet balance is now
        <strong>${params.balanceFormatted}</strong>.</p>
      <p>Fund your wallet to keep generating result PINs without interruption.</p>
    `,
      FOOTER.en,
    ),
  };
}

export function staffInviteEmail(params: { fullName: string; schoolName: string; activateUrl: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Vous avez été ajouté(e) à ${params.schoolName} sur Elorge Schools`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Bonjour ${params.fullName},</h2>
        <p>Vous avez été ajouté(e) comme membre du personnel à <strong>${params.schoolName}</strong> sur Elorge Schools.
          Définissez votre mot de passe pour activer votre compte — ce lien est valable 7 jours.</p>
        <p><a href="${params.activateUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Activer mon compte</a></p>
        <p>Si vous ne vous attendiez pas à ce message, veuillez contacter l'administration de votre école.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `Foi adicionado(a) a ${params.schoolName} na Elorge Schools`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Olá ${params.fullName},</h2>
        <p>Foi adicionado(a) como membro do pessoal em <strong>${params.schoolName}</strong> na Elorge Schools.
          Defina a sua palavra-passe para ativar a sua conta — este link é válido por 7 dias.</p>
        <p><a href="${params.activateUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Ativar a minha conta</a></p>
        <p>Se não esperava esta mensagem, contacte a administração da sua escola.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `You've been added to ${params.schoolName} on Elorge Schools`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Hi ${params.fullName},</h2>
      <p>You've been added as staff at <strong>${params.schoolName}</strong> on Elorge Schools. Set your password
        to activate your account — this link is valid for 7 days.</p>
      <p><a href="${params.activateUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Activate my account</a></p>
      <p>If you weren't expecting this, please contact your school administrator.</p>
    `,
      FOOTER.en,
    ),
  };
}

export function passwordResetEmail(params: { fullName: string; resetUrl: string; locale?: string }) {
  const l = resolveLocale(params.locale);
  if (l === 'fr') {
    return {
      subject: `Réinitialisez votre mot de passe Elorge Schools`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Bonjour ${params.fullName},</h2>
        <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez ci-dessous pour en choisir un nouveau —
          ce lien expire dans 30 minutes.</p>
        <p><a href="${params.resetUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Réinitialiser le mot de passe</a></p>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
      `,
        FOOTER.fr,
      ),
    };
  }
  if (l === 'pt') {
    return {
      subject: `Redefina a sua palavra-passe da Elorge Schools`,
      html: wrapper(
        `
        <h2 style="font-size: 20px;">Olá ${params.fullName},</h2>
        <p>Recebemos um pedido para redefinir a sua palavra-passe. Clique abaixo para escolher uma nova —
          este link expira em 30 minutos.</p>
        <p><a href="${params.resetUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Redefinir palavra-passe</a></p>
        <p>Se não foi você a solicitar isto, pode ignorar este e-mail em segurança.</p>
      `,
        FOOTER.pt,
      ),
    };
  }
  return {
    subject: `Reset your Elorge Schools password`,
    html: wrapper(
      `
      <h2 style="font-size: 20px;">Hi ${params.fullName},</h2>
      <p>We received a request to reset your password. Click below to choose a new one — this link expires in
        30 minutes.</p>
      <p><a href="${params.resetUrl}" style="display:inline-block;padding:10px 20px;background:#0b3d91;color:#fff;border-radius:6px;text-decoration:none;">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
      FOOTER.en,
    ),
  };
}
