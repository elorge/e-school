// web/app/[school]/admin/audit-log/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import { listSchoolAuditLog, type AuditLogEntry } from '@/lib/endpoints/audit-log';
import RequireRole from '@/components/RequireRole';
import LoadingScreen from '@/components/LoadingScreen';
import { History } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  'result.upserted': 'Result updated',
  'fee_payment.recorded': 'Fee payment recorded',
  'school.suspended': 'School suspended',
  'school.reactivated': 'School reactivated',
  'wallet.manual_credit': 'Wallet credited',
};

function summarize(entry: AuditLogEntry): string {
  const meta = entry.metadata ?? {};
  switch (entry.action) {
    case 'result.upserted':
      return `Scores saved for student ${meta.studentId ?? ''} (term ${meta.termId ?? ''})`;
    case 'fee_payment.recorded':
      return `₦${((meta.amountKobo as number) / 100).toLocaleString('en-NG')} via ${meta.method}`;
    case 'wallet.manual_credit':
      return `₦${((meta.amountKobo as number) / 100).toLocaleString('en-NG')} — ${meta.reason || 'no reason given'}`;
    default:
      return entry.entityType;
  }
}

export default function SchoolAuditLogPage({ params }: { params: { school: string } }) {
  const school = useSchool();
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
          <History size={20} /> {school.name} — Audit Log
        </h1>
        <p className="text-sm text-ink/60">
          A record of who did what — every result change, fee payment, and wallet credit for your school, with
          when it happened.
        </p>

        {entries.length === 0 ? (
          <p className="card text-sm text-ink/40">No activity recorded yet.</p>
        ) : (
          <div className="card">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-black/5 text-xs text-ink/50">
                  <tr>
                    <th className="px-3 py-2 text-left">When</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2 text-ink/60">{new Date(e.createdAt).toLocaleString('en-NG')}</td>
                      <td className="px-3 py-2">
                        <span className="badge badge-blue">{ACTION_LABELS[e.action] ?? e.action}</span>
                      </td>
                      <td className="px-3 py-2 text-ink/70">{summarize(e)}</td>
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