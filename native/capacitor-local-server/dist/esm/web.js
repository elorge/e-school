import { WebPlugin } from '@capacitor/core';
const NOT_AVAILABLE = 'LocalServer only runs inside the native Elorge Teacher app — a plain browser tab cannot host a local server for other devices to connect to.';
export class LocalServerWeb extends WebPlugin {
    async start(_options) {
        throw this.unavailable(NOT_AVAILABLE);
    }
    async setSlideIndex(_options) {
        throw this.unavailable(NOT_AVAILABLE);
    }
    async getConnectedCount() {
        throw this.unavailable(NOT_AVAILABLE);
    }
    async stop() {
        throw this.unavailable(NOT_AVAILABLE);
    }
}
