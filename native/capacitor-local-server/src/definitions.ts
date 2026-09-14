// native/capacitor-local-server/src/definitions.ts
export interface SlideData {
  heading: string;
  body?: string;
  materialUrl?: string;
}

export interface LocalServerPlugin {
  /** Starts the local HTTP server and returns the URL students should open. */
  start(options: { slides: SlideData[] }): Promise<{ viewerUrl: string }>;
  /** Pushes a new slide index to every connected/polling student. */
  setSlideIndex(options: { index: number }): Promise<void>;
  /** Best-effort count of distinct devices that have polled recently. */
  getConnectedCount(): Promise<{ count: number }>;
  /** Shuts the local server down. */
  stop(): Promise<void>;
}
