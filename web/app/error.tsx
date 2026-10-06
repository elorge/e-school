// web/app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">Something went wrong</p>
      <h1 className="font-display text-3xl font-semibold text-ink">This page hit a snag.</h1>
      <p className="text-ink/70">It is on our side, not yours. Try again, and if it keeps happening let us know.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-secondary">Go to homepage</Link>
        <Link href="/contact" className="btn-secondary">Contact us</Link>
      </div>
    </main>
  );
}
