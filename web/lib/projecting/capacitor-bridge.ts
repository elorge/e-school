// web/lib/projecting/capacitor-bridge.ts
'use client';

/**
 * The only file that knows the native local-server feature is built on
 * Capacitor specifically — everything else (contract.ts,
 * useProjectingSession.ts, the presenter page) only ever talks to
 * window.ElorgeLocalServer and has no idea Capacitor is involved. If
 * the native implementation ever changes to something other than
 * Capacitor, this is the only file that needs to change.
 *
 * Call installCapacitorLocalServerBridge() once, early, on any page
 * that might show the "Project to students" button — see
 * app/[school]/staff/lessons/[id]/present/page.tsx.
 */
export async function installCapacitorLocalServerBridge(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.ElorgeLocalServer) return; // already installed

  let Capacitor;
  try {
    ({ Capacitor } = await import('@capacitor/core'));
  } catch {
    return; // @capacitor/core isn't even bundled — definitely plain web, nothing to do
  }

  if (!Capacitor.isNativePlatform()) return; // running in a normal browser tab, not the native app

  const { LocalServer } = await import('elorge-capacitor-local-server');

  window.ElorgeLocalServer = {
    async start(slides) {
      return LocalServer.start({ slides });
    },
    async setSlideIndex(index) {
      await LocalServer.setSlideIndex({ index });
    },
    async getConnectedCount() {
      const { count } = await LocalServer.getConnectedCount();
      return count;
    },
    async stop() {
      await LocalServer.stop();
    },
  };

  // useProjectingSession checks isProjectingSupported() synchronously on
  // its very first render, which happens before this async install can
  // possibly finish — this event is how it learns the bridge showed up
  // a moment later, without polling or guessing a delay.
  window.dispatchEvent(new Event('elorge:local-server-ready'));
}
