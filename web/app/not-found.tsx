// web/app/not-found.tsx
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">404</p>
        <h1 className="font-display text-4xl font-semibold text-ink">We could not find that page.</h1>
        <p className="text-ink/70">The link may be old or mistyped. Here are some places to get back on track.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Go to homepage</Link>
          <Link href="/results" className="btn-secondary">Check a result</Link>
          <Link href="/contact" className="btn-secondary">Contact us</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
