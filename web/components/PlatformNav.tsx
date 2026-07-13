// web/components/PlatformNav.tsx
'use client';

import Image from 'next/image';
import { clearSessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';

/** Shared header for platform-wide (non-tenant) pages: /super-admin and /finance. */
export default function PlatformNav({ title }: { title: string }) {
  function handleLogout() {
    clearToken();
    clearSessionUser();
    window.location.href = '/login';
  }

  return (
    <nav className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="" width={36} height={36} aria-hidden />
        <span className="font-display font-semibold">{title}</span>
      </div>
      <button onClick={handleLogout} className="text-sm text-ink/50 underline">
        Log out
      </button>
    </nav>
  );
}