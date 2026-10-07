// web/components/AnalyticsTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMarketingLocale } from '@/lib/marketing-locale';
import { track } from '@/lib/analytics';

/** Marketing pages only — never a school's private app, the admin consoles or login. */
const TRACKED = ['/', '/about', '/contact', '/pricing', '/careers', '/signup', '/demo', '/features', '/results', '/privacy', '/terms'];

export default function AnalyticsTracker() {
  const pathname = usePathname() ?? '/';
  const { locale } = useMarketingLocale();
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    const tracked = TRACKED.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')));
    if (tracked) track('page_view', { locale: localeRef.current });
  }, [pathname]);

  return null;
}
