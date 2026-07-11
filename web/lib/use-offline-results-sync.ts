// web/lib/use-offline-results-sync.ts
'use client';

import { useEffect, useState } from 'react';
import { syncQueuedResults, getPendingResultsCount } from './endpoints/results';

/**
 * Drop this once near the top of your app layout (or any page with a
 * results-entry form). It automatically retries anything saved offline
 * whenever the browser comes back online, and once on initial load in
 * case the queue already had items from a previous offline session.
 */
export function useOfflineResultsSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const runSync = async () => {
    if (getPendingResultsCount() === 0) return;
    setIsSyncing(true);
    await syncQueuedResults();
    setPendingCount(getPendingResultsCount());
    setIsSyncing(false);
  };

  useEffect(() => {
    setPendingCount(getPendingResultsCount());
    runSync(); // in case the browser was already online when this mounted

    const handleOnline = () => runSync();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return { pendingCount, isSyncing };
}