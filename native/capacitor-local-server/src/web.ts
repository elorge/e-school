// native/capacitor-local-server/src/web.ts
import { WebPlugin } from '@capacitor/core';
import type { LocalServerPlugin, SlideData } from './definitions';

const NOT_AVAILABLE = 'LocalServer only runs inside the native Elorge Teacher app — a plain browser tab cannot host a local server for other devices to connect to.';

export class LocalServerWeb extends WebPlugin implements LocalServerPlugin {
  async start(_options: { slides: SlideData[] }): Promise<{ viewerUrl: string }> {
    throw this.unavailable(NOT_AVAILABLE);
  }
  async setSlideIndex(_options: { index: number }): Promise<void> {
    throw this.unavailable(NOT_AVAILABLE);
  }
  async getConnectedCount(): Promise<{ count: number }> {
    throw this.unavailable(NOT_AVAILABLE);
  }
  async stop(): Promise<void> {
    throw this.unavailable(NOT_AVAILABLE);
  }
}
