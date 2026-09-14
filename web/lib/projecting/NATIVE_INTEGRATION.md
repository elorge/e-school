# Projecting Sessions — Native Integration Guide

**Status: the plugin is written. It has never been compiled or run —
there is no Android Studio / Xcode / physical hotspot in the
environment this was built in. Treat everything below as "should
work, has not been verified" until someone builds and tests it on real
devices.**

## What's already built

- `native/capacitor-local-server/` — a full Capacitor plugin:
  - `src/` — TypeScript definitions + web fallback (throws a clear
    "native app only" error, never silently no-ops)
  - `android/` — Kotlin implementation using NanoHTTPD
  - `ios/` — Swift implementation using GCDWebServer
  - Podspec + build.gradle for both platforms
- `web/lib/projecting/capacitor-bridge.ts` — installs
  `window.ElorgeLocalServer` from this plugin, only when running
  inside the native app (checked via `Capacitor.isNativePlatform()`)
- `web/capacitor.config.ts` — points the native shell's WebView at the
  live hosted site (`elorgeschools.org`), not a static export. The app
  needs internet once, to load — see the comment in that file for why.
- The presenter page already calls `installCapacitorLocalServerBridge()`
  on mount and the "Project to students" button already works against
  whatever `window.ElorgeLocalServer` turns out to be.

## What still has to happen, in order

1. **Run `npx cap add android` and `npx cap add ios`** from `web/` —
   this generates the actual native project folders (`android/`,
   `ios/App/`) that don't exist yet. Needs Android Studio installed
   for the former, a Mac + Xcode for the latter.

2. **Register the plugin** with the generated native projects:
   - Android: add `implementation project(':capacitor-local-server')`
     (or equivalent, depending on how Capacitor's local-plugin linking
     resolves it) to `android/app/build.gradle`.
   - iOS: run `pod install` inside `ios/App/` after adding the plugin's
     podspec to the generated `Podfile`.

3. **Bundle the viewer page into both native projects:**
   - Android: copy `web/public/present-viewer/` to
     `android/app/src/main/assets/present-viewer/` — the Kotlin code
     reads it from there by exact path.
   - iOS: add `web/public/present-viewer/` to the Xcode project as a
     **folder reference** (blue folder icon in Xcode, not a yellow
     group) named exactly `present-viewer`, so
     `Bundle.main.path(forResource: "present-viewer", ofType: nil)`
     in the Swift code finds it.
   - Neither of these is automated yet — do it again after every
     change to the viewer page until someone scripts it.

4. **iOS-specific config** (`ios/App/App/Info.plist`):
   - App Transport Security: the viewer is served over plain
     `http://`, not `https://`, since it's a local server with no
     certificate. Add an ATS exception for local networking, or
     (simpler, since the exact local IP isn't known ahead of time) an
     `NSAllowsArbitraryLoadsInWebContent` / local-network-specific
     exception — check Apple's current guidance, this area of ATS
     config has shifted across iOS versions.
   - Add `NSLocalNetworkUsageDescription` — a user-facing string
     explaining why the app touches the local network. Whether iOS
     actually prompts for this on a pure-listener (never dials out)
     socket varies by version in developer reports; verify on the
     actual target iOS version rather than assuming either way.

5. **Android-specific config** (`android/app/src/main/AndroidManifest.xml`):
   - Confirm `<uses-permission android:name="android.permission.INTERNET" />`
     is present (it almost certainly already is for any Capacitor app,
     but a local server dying silently because this was missing would
     be a nasty one to debug).

6. **Test on two REAL physical devices**, not emulators — emulator
   networking does not reliably reproduce real hotspot behavior:
   - Turn on Personal Hotspot / mobile hotspot on the "teacher" device,
     with mobile data OFF (the whole point being tested).
   - Confirm `findLocalIpAddress()` (Android) /
     `getLocalIPAddress()` (iOS) actually returns the hotspot's real
     address on that specific device — this is flagged as a caveat in
     both source files for a reason; OEM/version variance here is the
     most likely first bug.
   - Join with a second device's plain browser, confirm the viewer
     loads and updates as the teacher advances slides.

## The one thing this doc doesn't solve: materials

`slides[].materialUrl` still points at Cloudinary URLs. Someone needs
to decide how lesson-note materials get downloaded to the teacher's
device ahead of time and rewire `materialUrl` to a local path/blob
before calling `start()` — this plugin serves whatever URL it's given,
it doesn't fetch or cache anything itself.
