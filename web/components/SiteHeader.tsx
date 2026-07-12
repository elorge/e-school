// web/components/SiteHeader.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-paper/90 px-6 py-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="Elorge Schools" width={44} height={44} className="rounded-full" priority />
        <span className="font-display text-xl font-semibold tracking-tight">Elorge Schools</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <a href="#features" className="hidden text-ink/70 hover:text-ink sm:inline">
          Features
        </a>
        <a href="#offline" className="hidden text-ink/70 hover:text-ink sm:inline">
          Offline-first
        </a>
        <Link href="/login" className="text-ink/70 hover:text-ink">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-brand-blue px-4 py-2 font-medium text-white transition hover:bg-brand-blue-dark"
        >
          Get started
        </Link>
      </nav>
    </header>
  );
}