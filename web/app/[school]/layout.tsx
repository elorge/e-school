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

  return (
    <SchoolProvider school={school}>
      <SchoolNav slug={params.school} schoolName={school.name} sessionWrapEnabled={school.sessionWrapEnabled} />
      <div className="p-4">{children}</div>
    </SchoolProvider>
  );
}