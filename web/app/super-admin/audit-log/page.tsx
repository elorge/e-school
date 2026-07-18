// web/app/super-admin/audit-log/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { listPlatformAuditLog, type AuditLogEntry } from '@/lib/endpoints/platform-audit';
import { searchSchools } from '@/lib/endpoints/school-search';
import PlatformNav from '@/components/PlatformNav';
import LoadingScreen from '@/components/LoadingScreen';
import SchoolSearchInput from '@/components/SchoolSearchInput';
import { getSessionUser } from '@/lib/session';
import { History } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  'result.upserted': 'Result updated',
  'fee_payment.recorded': 'Fee payment recorded',
  'school.suspended': 'School suspended',
  'school.reactivated': 'School reactivated',
  'wallet.manual_credit': 'Wallet credited',
};

export default function PlatformAuditLogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.role !== 'SUPER_ADMIN') {
      window.location.href = '/login';
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(schoolId?: string) {
    setIsLoading(true);
    try {
      setEntries((await listPlatformAuditLog(schoolId)) ?? []);
    } catch {
      setError('Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <PlatformNav title="Elorge — Platform Audit Log" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <History size={20} /> Every school's activity
        </h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-4 flex items-center gap-2">
          <SchoolSearchInput
            onSelect={(school) => {
              setSchoolFilter({ id: school.id, name: school.name });
              load(school.id);
            }}
          />
          {schoolFilter && (
            <button
              onClick={() => {
                setSchoolFilter(null);
                load();
              }}
              className="text-xs text-brand-blue underline"
            >
              Clear filter ({schoolFilter.name})
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="card text-sm text-ink/40">No activity recorded.</p>
        ) : (
          <div className="card">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-black/5 text-xs text-ink/50">
                  <tr>
                    <th className="px-3 py-2 text-left">When</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2 text-ink/60">{new Date(e.createdAt).toLocaleString('en-NG')}</td>
                      <td className="px-3 py-2">
                        <span className="badge badge-blue">{ACTION_LABELS[e.action] ?? e.action}</span>
                      </td>
                      <td className="px-3 py-2 text-ink/70">
                        {e.entityType} — <span className="font-mono text-xs">{e.entityId.slice(0, 8)}…</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}