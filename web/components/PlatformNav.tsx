// web/components/PlatformNav.tsx
'use client';

import Image from 'next/image';
import { clearSessionUser } from '@/lib/session';
import { clearToken } from '@/lib/api';
import { LogOut } from 'lucide-react';

/** Shared header for platform-wide (non-tenant) pages: /super-admin and /finance. */
export default function PlatformNav({ title }: { title: string }) {
  function handleLogout() {
    clearToken();
    clearSessionUser();
    window.location.href = '/login';
  }

  return (
    <nav className="nav-wash flex items-center justify-between border-b border-black/5 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="" width={36} height={36} aria-hidden />
        <span className="font-display font-semibold">{title}</span>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-ink/50">
        <LogOut size={15} />
        Log out
      </button>
    </nav>
  );
}