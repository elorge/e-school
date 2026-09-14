// web/capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

/**
 * server.url points the native app's WebView at the LIVE hosted site,
 * the same one at elorgeschools.org — this is deliberately not a
 * static export of the Next.js app. The native shell exists for
 * exactly one reason: to make window.ElorgeLocalServer available (see
 * lib/projecting/capacitor-bridge.ts). Everything else about the app
 * — every page, every language, every recent deploy — stays identical
 * to the normal website, because it IS the normal website, just
 * running inside a thin native wrapper instead of Chrome/Safari.
 *
 * This does mean the app needs SOME internet the first time it opens
 * (to load the page at all) — see NATIVE_INTEGRATION.md for why that's
 * an acceptable tradeoff (a teacher opens the app before class, while
 * they still have signal, then the projecting session itself needs
 * none) and what changes if that assumption turns out to be wrong.
 */
const config: CapacitorConfig = {
  appId: 'org.elorgeschools.teacher',
  appName: 'Elorge Teacher',
  webDir: 'public', // unused while server.url is set, but required by the CLI
  server: {
    url: 'https://elorgeschools.org',
    cleartext: false,
  },
  android: {
    // Local HTTP (the viewer page, served on the hotspot's own LAN) is
    // a completely separate concern from this — this only affects
    // whether the WebView's OWN top-level navigation can use non-HTTPS
    // URLs, which it never needs to for elorgeschools.org itself.
    allowMixedContent: false,
  },
};

export default config;
