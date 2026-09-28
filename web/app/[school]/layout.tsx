// web/app/[school]/layout.tsx
import { notFound } from 'next/navigation';
import { getSchoolBySlug } from '@/lib/endpoints/schools';
import { SchoolProvider } from '@/lib/school-context';
import SchoolNav from '@/components/SchoolNav';

/**
 * Every route under [school] is tenant-scoped. Fetches the school once
 * here — GET /schools/:slug is @Public() so this works server-side with
 * no token — and hands it to child pages via context.
 */
export default async function SchoolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { school: string };
}) {
  const school = await getSchoolBySlug(params.school);
  if (!school) notFound();

  // Defensive normalization: `currency` (and a couple of related fields)
  // are NOT NULL, required-at-creation columns — every path that creates
  // a School (SchoolsService.create, the signup-approval flow, seed.ts)
  // validates them. If one is still missing here, this school's row
  // predates that requirement and was never backfilled — most likely a
  // database that had `prisma db push` run against an older snapshot of
  // schema.prisma rather than `prisma migrate deploy` (which would have
  // run migrations/20260824013917_add_multi_currency_support's backfill).
  // Every page downstream (Fund Wallet, Fees, Accounting, Payroll, ...)
  // builds display strings like `Amount (${school.currency})`, so a
  // missing value doesn't fail loudly — it prints the literal word
  // "undefined" into the UI. Falling back here stops that, but this is a
  // BAND-AID: the underlying row is still wrong. Fix it directly —
  //   SELECT id, slug, "countryCode", currency FROM schools WHERE currency IS NULL OR "countryCode" IS NULL;
  //   UPDATE schools SET "countryCode" = 'NG', currency = 'NGN' WHERE slug = '<slug>';
  // (swap in the real country/currency for that school if it isn't NG/NGN).
  if (!school.currency || !school.countryCode) {
    console.error(
      `[SchoolLayout] School "${school.slug}" is missing countryCode/currency in the database — falling back to NG/NGN so the UI doesn't show "undefined". Fix the row directly; see the comment in web/app/[school]/layout.tsx.`,
    );
  }
  const normalizedSchool = {
    ...school,
    countryCode: school.countryCode || 'NG',
    currency: school.currency || 'NGN',
  };

  return (
    <SchoolProvider school={normalizedSchool}>
      <SchoolNav slug={params.school} schoolName={school.name} sessionWrapEnabled={school.sessionWrapEnabled} />
      <div className="p-4">{children}</div>
    </SchoolProvider>
  );
}