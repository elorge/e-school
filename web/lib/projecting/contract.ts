// web/lib/projecting/contract.ts
/**
 * PROJECTING SESSIONS — CONTRACT
 * ================================
 * A "projecting session" lets a teacher present a lesson note to
 * students' own phones over a WiFi hotspot with ZERO internet — the
 * teacher's phone becomes the server, not just the presenter.
 *
 * This file defines the ONLY interface between:
 *   (a) the web UI in [school]/staff/lessons/[id]/present/page.tsx, and
 *   (b) whatever native layer eventually runs a local HTTP server
 *       on the teacher's device (see NATIVE_INTEGRATION.md).
 *
 * The web UI never assumes HOW the local server is implemented — it
 * only calls window.ElorgeLocalServer, a bridge object a native shell
 * (e.g. a Capacitor plugin) is responsible for injecting into the page
 * before this code runs. Until that native layer exists,
 * window.ElorgeLocalServer is simply undefined, and useProjectingSession
 * degrades to a clear "not available on this device" state — it never
 * throws or silently no-ops.
 *
 * STUDENT SIDE — no app, no login. A student's plain browser loads the
 * static viewer at web/public/present-viewer/index.html (served BY the
 * local server, not by Elorge's cloud backend — there's no internet to
 * reach it) and polls two endpoints the local server must expose:
 *
 *   GET /api/slides
 *     → SlideData[]   (sent once, when the viewer first loads)
 *
 *   GET /api/state
 *     → { slideIndex: number, updatedAt: number }   (polled every ~1.5s)
 *
 * Material images referenced by a slide's `materialUrl` must ALSO be
 * servable from the local server with no internet involved — meaning
 * the native layer is responsible for having already downloaded any
 * materials for this note onto the device before the session starts,
 * and rewriting materialUrl to a local path/blob it can serve. The web
 * UI does not handle that download step; it only ever deals with
 * whatever materialUrl it's given.
 */

export interface SlideData {
  heading: string;
  body?: string;
  materialUrl?: string;
}

export interface ProjectingState {
  slideIndex: number;
  updatedAt: number;
}

/**
 * The bridge a native shell must inject as window.ElorgeLocalServer.
 * Every method is async since real implementations cross into native
 * code. connectedCount is a best-effort headcount — implementations
 * that can't track it should just resolve 0 rather than fail.
 */
export interface LocalServerBridge {
  /** Starts the local HTTP server and returns the URL students should open. */
  start(slides: SlideData[]): Promise<{ viewerUrl: string }>;
  /** Pushes a new slide index to every connected/polling student. */
  setSlideIndex(index: number): Promise<void>;
  /** Best-effort count of distinct devices that have polled recently. */
  getConnectedCount(): Promise<number>;
  /** Shuts the local server down. */
  stop(): Promise<void>;
}

declare global {
  interface Window {
    ElorgeLocalServer?: LocalServerBridge;
  }
}

export function isProjectingSupported(): boolean {
  return typeof window !== 'undefined' && !!window.ElorgeLocalServer;
}
