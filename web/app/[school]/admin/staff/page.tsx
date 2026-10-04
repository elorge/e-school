// web/app/[school]/admin/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/school-context';
import LoadingScreen from '@/components/LoadingScreen';
import RequireRole from '@/components/RequireRole';
import { FileSpreadsheet, Users } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { downloadStaffBankDetailsXlsx, listStaffProfiles, type StaffProfile } from '@/lib/endpoints/staff';

export default function StaffDirectoryPage({ params }: { params: { school: string } }) {
  const school = useSchool();
  const money = (kobo: number) => formatMoney(kobo, school.currency, school.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The API creates a profile for every admin/staff login that lacks one,
    // so this list always covers everyone with an account.
    listStaffProfiles(params.school)
      .then(setProfiles)
      .catch(() => setError('Could not load staff.'))
      .finally(() => setIsLoading(false));
  }, [params.school]);

  async function handleDownloadBankDetails() {
    try {
      const blob = await downloadStaffBankDetailsXlsx(params.school);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff-bank-details.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not download the bank details.');
    }
  }

  const isComplete = (p: StaffProfile) => !!(p.bankName && p.bankAccountNumber && p.bankAccountName);
  const missingCount = profiles.filter((p) => p.employmentStatus === 'ACTIVE' && !isComplete(p)).length;

  if (isLoading) return <LoadingScreen />;

  return (
    <RequireRole allow={['SCHOOL_ADMIN']}>
      <main className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Users size={20} />
            {school.name} — Staff Directory
          </h1>
          <button onClick={handleDownloadBankDetails} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm">
            <FileSpreadsheet size={15} /> Download bank details (Excel)
          </button>
        </div>
        <p className="text-sm text-ink/60">
          Everyone with a staff or admin login appears here automatically. Open a profile to set their job title, department and pay, and to see the
          personal details they have added themselves (contact, next of kin, bank). New logins are created from Settings → invite staff.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {missingCount > 0 && (
          <p className="text-sm text-amber-700">
            {missingCount} active staff member(s) haven&apos;t completed their bank details yet — they can&apos;t be included on a bank payment schedule until they do
            (staff add these under My Info → Edit details).
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-2">Staff ID</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Designation</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Base salary</th>
                <th className="px-3 py-2">Bank</th>
                <th className="px-3 py-2">Account no.</th>
                <th className="px-3 py-2">Account name</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t hover:bg-black/5">
                  <td className="px-3 py-2">
                    <Link href={`/${params.school}/admin/staff/${p.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
                      {p.staffId}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{p.user.fullName}</td>
                  <td className="px-3 py-2 text-xs text-ink/60">{p.user.role === 'SCHOOL_ADMIN' ? 'Admin' : 'Staff'}</td>
                  <td className="px-3 py-2">{p.department ?? '—'}</td>
                  <td className="px-3 py-2">{p.designation ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.employmentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {p.baseSalaryKobo > 0 ? money(p.baseSalaryKobo) : <span className="text-amber-700">Not set</span>}
                  </td>
                  <td className="px-3 py-2">{p.bankName ?? <span className="text-amber-700">Missing</span>}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.bankAccountNumber ?? <span className="text-amber-700">Missing</span>}</td>
                  <td className="px-3 py-2">{p.bankAccountName ?? <span className="text-amber-700">Missing</span>}</td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-ink/50">
                    No staff yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </RequireRole>
  );
}
