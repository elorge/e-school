// web/lib/projecting/useProjectingSession.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isProjectingSupported, type SlideData } from './contract';

export type ProjectingStatus = 'unavailable' | 'idle' | 'starting' | 'active' | 'error';

export interface ProjectingSession {
  status: ProjectingStatus;
  viewerUrl: string | null;
  connectedCount: number;
  error: string | null;
  start: (slides: SlideData[]) => Promise<void>;
  stop: () => Promise<void>;
  /** Call whenever the teacher's own current slide index changes. No-op while inactive. */
  syncSlideIndex: (index: number) => void;
}

const CONNECTED_COUNT_POLL_MS = 4000;

/**
 * The web-side half of a projecting session — see contract.ts for the
 * full picture. This hook never talks to a real server itself; it only
 * calls whatever window.ElorgeLocalServer a native shell has injected.
 * On a plain browser/PWA with no native shell, status stays 'unavailable'
 * forever — the UI is expected to show that plainly rather than offer a
 * button that can never work.
 */
export function useProjectingSession(): ProjectingSession {
  const [status, setStatus] = useState<ProjectingStatus>(() => (isProjectingSupported() ? 'idle' : 'unavailable'));
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // The bridge (see capacitor-bridge.ts) installs asynchronously,
    // which can easily finish after this hook's first render already
    // read isProjectingSupported() as false. This catches that case
    // without polling — see the matching dispatch in capacitor-bridge.ts.
    if (status !== 'unavailable') return;
    function handleReady() {
      if (isProjectingSupported()) setStatus('idle');
    }
    window.addEventListener('elorge:local-server-ready', handleReady);
    return () => window.removeEventListener('elorge:local-server-ready', handleReady);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const start = useCallback(async (slides: SlideData[]) => {
    if (!window.ElorgeLocalServer) {
      setStatus('unavailable');
      return;
    }
    setStatus('starting');
    setError(null);
    try {
      const { viewerUrl } = await window.ElorgeLocalServer.start(slides);
      setViewerUrl(viewerUrl);
      setStatus('active');
      pollRef.current = setInterval(async () => {
        try {
          const count = await window.ElorgeLocalServer!.getConnectedCount();
          setConnectedCount(count);
        } catch {
          // A single failed headcount poll isn't worth surfacing — the
          // session itself is still fine, we just don't have a fresh count.
        }
      }, CONNECTED_COUNT_POLL_MS);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not start projecting');
    }
  }, []);

  const stop = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try {
      await window.ElorgeLocalServer?.stop();
    } finally {
      setStatus(isProjectingSupported() ? 'idle' : 'unavailable');
      setViewerUrl(null);
      setConnectedCount(0);
    }
  }, []);

  const syncSlideIndex = useCallback(
    (index: number) => {
      if (status !== 'active') return;
      window.ElorgeLocalServer?.setSlideIndex(index).catch(() => {
        // Best-effort — a dropped update self-corrects on the student's
        // next poll once this call (or a later one) succeeds.
      });
    },
    [status],
  );

  return { status, viewerUrl, connectedCount, error, start, stop, syncSlideIndex };
}
