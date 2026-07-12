// web/components/InstallPrompt.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const DISMISS_KEY = 'eschools_pwa_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't re-nag for a week after "Cancel"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Mounted once in the root layout, so it's alive on EVERY route —
 * marketing pages, /login, /signup, and every tenant page — not just
 * inside [school]. Chrome/Edge fire beforeinstallprompt once per
 * session at most; this captures it the moment it fires and holds onto
 * it until the person acts, rather than relying on the browser's own
 * (often invisible) default UI.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // iOS Safari never fires beforeinstallprompt at all — it needs the
    // manual "Share → Add to Home Screen" flow, so we show different
    // copy for it instead of a broken Install button.
    const ua = window.navigator.userAgent;
    setIsIos(/iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream);

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_COOLDOWN_MS) return;

    // Already installed and running standalone — nothing to prompt.
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS gets the banner too, on a short delay, since there's no event to wait for.
    if (/iphone|ipad|ipod/i.test(ua) && !dismissedAt) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice; // resolves once the person taps Install or Cancel in the native dialog
    setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-xl sm:inset-x-auto sm:right-4 sm:w-80">
      <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="shrink-0 rounded-lg" aria-hidden />
      <div className="flex-1 text-sm">
        <p className="font-medium">Install Elorge Schools</p>
        <p className="text-xs text-ink/60">
          {isIos
            ? 'Tap Share, then "Add to Home Screen".'
            : 'Add it to your home screen for faster, offline-ready access.'}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        {!isIos && (
          <button onClick={handleInstall} className="rounded-full bg-brand-blue px-3 py-1.5 text-xs font-medium text-white">
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="rounded-full border px-3 py-1.5 text-xs text-ink/60">
          {isIos ? 'Got it' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}