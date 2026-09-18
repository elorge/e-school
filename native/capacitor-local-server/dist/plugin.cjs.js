'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const core = require('@capacitor/core');

const NOT_AVAILABLE = 'LocalServer only runs inside the native Elorge Teacher app — a plain browser tab cannot host a local server for other devices to connect to.';

class LocalServerWeb extends core.WebPlugin {
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

const LocalServer = core.registerPlugin('LocalServer', {
  web: () => Promise.resolve(new LocalServerWeb()),
});

exports.LocalServer = LocalServer;
exports.LocalServerWeb = LocalServerWeb;
