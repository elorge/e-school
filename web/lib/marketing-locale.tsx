// web/lib/marketing-locale.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { PLATFORM_DEFAULT_LOCALE, SupportedLocale, isSupportedLocale } from './locale';

function readCookieLocale(): SupportedLocale {
  if (typeof document === 'undefined') return PLATFORM_DEFAULT_LOCALE;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  // Was hardcoded to only ever recognize 'fr' — every other saved
  // language (e.g. 'pt') silently fell back to English on reload. Check
  // against the actual supported-locale list instead, so adding a new
  // language here doesn't also require remembering to update this check.
  return value && isSupportedLocale(value) ? value : PLATFORM_DEFAULT_LOCALE;
}

interface MarketingLocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const MarketingLocaleContext = createContext<MarketingLocaleContextValue>({
  locale: PLATFORM_DEFAULT_LOCALE,
  setLocale: () => {},
});

/**
 * Wraps the whole app (see app/layout.tsx) so any marketing/auth page can
 * call useMarketingLocale(). Pages under [school]/ ignore this entirely
 * and use useSchool().locale instead — the two are deliberately separate,
 * since a visitor's browser language has nothing to do with any specific
 * school's configured language.
 */
export function MarketingLocaleProvider({ children }: { children: React.ReactNode }) {
  // Starts at the platform default and syncs to the real cookie value
  // just after mount — avoids a server/client render mismatch, since
  // the server has no reliable way to read this cookie for a static shell.
  const [locale, setLocaleState] = useState<SupportedLocale>(PLATFORM_DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readCookieLocale());
  }, []);

  function setLocale(next: SupportedLocale) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLocaleState(next);
  }

  return <MarketingLocaleContext.Provider value={{ locale, setLocale }}>{children}</MarketingLocaleContext.Provider>;
}

export function useMarketingLocale() {
  return useContext(MarketingLocaleContext);
}
