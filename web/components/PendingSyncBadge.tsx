// web/components/PendingSyncBadge.tsx
'use client';

import { useOfflineResultsSync } from '@/lib/use-offline-results-sync';
import { useOfflineStudentsSync } from '@/lib/use-offline-students-sync';

/**
 * Combines BOTH offline queues (results + student registrations) into one
 * indicator, so a teacher checks one spot instead of two. Renders nothing
 * when there's nothing pending.
 */
export default function PendingSyncBadge() {
  const results = useOfflineResultsSync();
  const students = useOfflineStudentsSync();

  const pendingCount = results.pendingCount + students.pendingCount;
  const isSyncing = results.isSyncing || students.isSyncing;

  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <div className="rounded-md bg-amber-100 px-3 py-1 text-sm text-amber-800">
      {isSyncing ? 'Syncing offline data…' : `${pendingCount} item(s) waiting to sync`}
    </div>
  );
}