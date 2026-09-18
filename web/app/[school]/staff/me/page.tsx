// web/app/[school]/staff/me/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { Contact, Download } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { getMyStaffProfile, downloadStaffIdCardPdf, listStaffAttendance, type StaffProfile, type StaffAttendanceRecord } from '@/lib/endpoints/staff';
import { ApiError } from '@/lib/api';

export default function MyStaffProfilePage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [attendance, setAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyStaffProfile(params.school);
        setProfile(p);
        setAttendance(await listStaffAttendance(params.school, p.id));
      } catch (err) {
        setError(err instanceof ApiError && err.status === 404 ? 'Your HR profile hasn\u2019t been set up yet — ask your school admin.' : 'Could not load your profile.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.school]);

  async function handleDownloadCard() {
    if (!profile) return;
    try {
      const blob = await downloadStaffIdCardPdf(params.school, profile.id);
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      setError('No ID card has been issued for you yet — ask your school admin to issue one.');
    }
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['STAFF', 'SCHOOL_ADMIN']}>
      <main className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-xl font-semibold">My Info</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {profile && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
              <div>
                <p className="text-lg font-medium">{profile.user.fullName}</p>
                <p className="text-sm text-ink/60">
                  {profile.staffId} · {profile.designation ?? 'Staff'} {profile.department ? `· ${profile.department}` : ''}
                </p>
              </div>
              <button onClick={handleDownloadCard} className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-sm text-white">
                <Contact size={15} />
                <Download size={15} /> My ID card
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 text-sm sm:grid-cols-2">
              <p>
                <span className="text-ink/50">Employment status:</span> {profile.employmentStatus}
              </p>
              <p>
                <span className="text-ink/50">Employment type:</span> {profile.employmentType.replace('_', ' ')}
              </p>
              <p>
                <span className="text-ink/50">Monthly base salary:</span> {money(profile.baseSalaryKobo)}
              </p>
              <p>
                <span className="text-ink/50">Phone:</span> {profile.phone ?? '—'}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <p className="mb-2 text-sm font-medium">Recent attendance</p>
              {attendance.length === 0 ? (
                <p className="text-sm text-ink/50">No attendance recorded yet.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {attendance.slice(0, 10).map((a) => (
                    <li key={a.id} className="flex justify-between border-b py-1 last:border-0">
                      <span>{a.direction === 'CLOCK_IN' ? 'Clock in' : 'Clock out'}</span>
                      <span className="text-ink/50">{new Date(a.occurredAt).toLocaleString(school.locale)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </RequireRole>
  );
}
