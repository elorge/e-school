// web/components/MustChangePasswordGate.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSessionUser } from '@/lib/session';

/**
 * A person with mustChangePassword=true who bookmarks /admin directly
 * (skipping the login page's redirect) would otherwise land right in the
 * app on a temporary password. This runs on every route and bounces
 * them back until they've actually changed it.
 */
export default function MustChangePasswordGate() {
  const pathname = usePathname();

  useEffect(() => {
    const user = getSessionUser();
    if (user?.mustChangePassword && pathname !== '/change-password') {
      window.location.href = '/change-password';
    }
  }, [pathname]);

  return null;
}