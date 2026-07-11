// web/app/about/page.tsx
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 font-display text-3xl font-semibold">About Elorge</h1>
        <p className="mb-4 text-ink/70">
          {/* TODO: replace with your real founding story / mission statement */}
          Elorge Technologies Limited builds software for schools that take their records seriously — results
          parents can verify, ID cards that work at the gate, and a wallet that doesn't need a finance degree to
          understand.
        </p>
        <p className="mb-4 text-ink/70">
          {/* TODO: add real company details once you have them — registration info, year founded, team, location */}
          We're a Nigerian software company focused on IT infrastructure and development for the education sector.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}