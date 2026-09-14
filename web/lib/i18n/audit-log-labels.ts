// web/lib/i18n/audit-log-labels.ts
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale } from '../locale';

export interface AuditLogLabels {
  pageTitle: string;
  description: string;
  noActivity: string;
  colWhen: string;
  colAction: string;
  colDetails: string;
  actionResultUpdated: string;
  actionFeePaymentRecorded: string;
  actionSchoolSuspended: string;
  actionSchoolReactivated: string;
  actionWalletCredited: string;
  scoresSavedFor: (studentId: string, termId: string) => string;
  viaMethod: (amount: string, method: string) => string;
  creditReason: (amount: string, reason: string) => string;
  noReasonGiven: string;
}

const EN: AuditLogLabels = {
  pageTitle: 'Audit Log',
  description: 'A record of who did what — every result change, fee payment, and wallet credit for your school, with when it happened.',
  noActivity: 'No activity recorded yet.',
  colWhen: 'When',
  colAction: 'Action',
  colDetails: 'Details',
  actionResultUpdated: 'Result updated',
  actionFeePaymentRecorded: 'Fee payment recorded',
  actionSchoolSuspended: 'School suspended',
  actionSchoolReactivated: 'School reactivated',
  actionWalletCredited: 'Wallet credited',
  scoresSavedFor: (studentId, termId) => `Scores saved for student ${studentId} (term ${termId})`,
  viaMethod: (amount, method) => `${amount} via ${method}`,
  creditReason: (amount, reason) => `${amount} — ${reason}`,
  noReasonGiven: 'no reason given',
};

const FR: AuditLogLabels = {
  pageTitle: "Journal d'audit",
  description: "Un registre de qui a fait quoi — chaque modification de résultat, paiement de frais et crédit de portefeuille pour votre école, avec la date et l'heure.",
  noActivity: 'Aucune activité enregistrée pour le moment.',
  colWhen: 'Quand',
  colAction: 'Action',
  colDetails: 'Détails',
  actionResultUpdated: 'Résultat modifié',
  actionFeePaymentRecorded: 'Paiement de frais enregistré',
  actionSchoolSuspended: 'École suspendue',
  actionSchoolReactivated: 'École réactivée',
  actionWalletCredited: 'Portefeuille crédité',
  scoresSavedFor: (studentId, termId) => `Notes enregistrées pour l'élève ${studentId} (trimestre ${termId})`,
  viaMethod: (amount, method) => `${amount} via ${method}`,
  creditReason: (amount, reason) => `${amount} — ${reason}`,
  noReasonGiven: 'aucune raison indiquée',
};

const AUDIT_LOG_LABELS_BY_LOCALE: Record<SupportedLocale, AuditLogLabels> = { en: EN, fr: FR };

export function auditLogLabelsFor(locale: string): AuditLogLabels {
  return AUDIT_LOG_LABELS_BY_LOCALE[locale as SupportedLocale] ?? AUDIT_LOG_LABELS_BY_LOCALE[PLATFORM_DEFAULT_LOCALE];
}
