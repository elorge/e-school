// web/lib/use-offline-students-sync.ts
'use client';

import { useEffect, useState } from 'react';
import { syncQueuedStudents, getPendingStudentsCount } from './endpoints/students';
import type { Student } from './types';

export function useOfflineStudentsSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Student[]>([]);

  const runSync = async () => {
    if (getPendingStudentsCount() === 0) return;
    setIsSyncing(true);
    const { synced } = await syncQueuedStudents();
    setLastSynced(synced);
    setPendingCount(getPendingStudentsCount());
    setIsSyncing(false);
  };

  useEffect(() => {
    setPendingCount(getPendingStudentsCount());
    runSync();

    const handleOnline = () => runSync();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return { pendingCount, isSyncing, lastSynced };
}