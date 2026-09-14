// web/app/[school]/admin/audit-log/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listSchoolAuditLog, type AuditLogEntry } from '@/lib/endpoints/audit-log';
import { formatMoney } from '@/lib/currency';
import { auditLogLabelsFor, type AuditLogLabels } from '@/lib/i18n/audit-log-labels';
import RequireRole from '@/components/RequireRole';
import LoadingScreen from '@/components/LoadingScreen';
import { History } from 'lucide-react';

function actionLabel(action: string, t: AuditLogLabels): string {
  switch (action) {
    case 'result.upserted':
      return t.actionResultUpdated;
    case 'fee_payment.recorded':
      return t.actionFeePaymentRecorded;
    case 'school.suspended':
      return t.actionSchoolSuspended;
    case 'school.reactivated':
      return t.actionSchoolReactivated;
    case 'wallet.manual_credit':
      return t.actionWalletCredited;
    default:
      return action;
  }
}

function summarize(entry: AuditLogEntry, currency: string, locale: string, t: AuditLogLabels): string {
  const meta = entry.metadata ?? {};
  switch (entry.action) {
    case 'result.upserted':
      return t.scoresSavedFor(String(meta.studentId ?? ''), String(meta.termId ?? ''));
    case 'fee_payment.recorded':
      return t.viaMethod(formatMoney(meta.amountKobo as number, currency, locale), String(meta.method));
    case 'wallet.manual_credit':
      return t.creditReason(formatMoney(meta.amountKobo as number, currency, locale), String(meta.reason || t.noReasonGiven));
    default:
      return entry.entityType;
  }
}

export default function SchoolAuditLogPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const t = auditLogLabelsFor(school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    listSchoolAuditLog(params.school)
      .then((e) => setEntries(e ?? []))
      .finally(() => setIsLoading(false));
  }, [params.school]);

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <History size={20} /> {school.name} — {t.pageTitle}
        </h1>
        <p className="text-sm text-ink/60">{t.description}</p>

        {entries.length === 0 ? (
          <p className="card text-sm text-ink/40">{t.noActivity}</p>
        ) : (
          <div className="card">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-black/5 text-xs text-ink/50">
                  <tr>
                    <th className="px-3 py-2 text-left">{t.colWhen}</th>
                    <th className="px-3 py-2 text-left">{t.colAction}</th>
                    <th className="px-3 py-2 text-left">{t.colDetails}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2 text-ink/60">{new Date(e.createdAt).toLocaleString(school.locale)}</td>
                      <td className="px-3 py-2">
                        <span className="badge badge-blue">{actionLabel(e.action, t)}</span>
                      </td>
                      <td className="px-3 py-2 text-ink/70">{summarize(e, school.currency, school.locale, t)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </RequireRole>
  );
}
