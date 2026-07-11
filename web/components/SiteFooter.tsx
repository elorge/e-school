// web/components/SiteFooter.tsx
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/5 px-6 py-10 text-sm text-ink/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={20} height={20} className="rounded-full" aria-hidden />
            <span>Elorge Technologies Limited — Software Development &amp; IT Infrastructure</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="hover:text-ink">
              About
            </Link>
            <a href="mailto:hello@elorgeschools.com" className="hover:text-ink">
              hello@elorgeschools.com
            </a>
          </div>
        </div>
        {/* TODO: replace # with your real handles, or delete any you don't have */}
        <div className="flex gap-4 text-xs">
          <a href="#" className="hover:text-ink">
            X / Twitter
          </a>
          <a href="#" className="hover:text-ink">
            Instagram
          </a>
          <a href="#" className="hover:text-ink">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}