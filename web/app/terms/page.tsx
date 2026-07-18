// web/app/terms/page.tsx
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 text-sm text-ink/80">
        <h1 className="mb-2 font-display text-3xl font-semibold text-ink">Terms of Service</h1>
        <p className="mb-8 text-xs text-ink/50">Last updated: [DATE] — Elorge Technologies Limited</p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">1. The service</h2>
        <p className="mb-4">
          Elorge Schools ("the Platform") is a school-management service provided by Elorge Technologies Limited
          ("Elorge", "we") to registered schools ("you", "the School"). By creating a school workspace, you agree
          to these terms on behalf of your institution.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">2. Your responsibilities</h2>
        <p className="mb-4">
          You are responsible for obtaining lawful consent from parents/guardians before submitting student data
          to the Platform, for the accuracy of results and records entered by your staff, and for keeping staff
          login credentials secure. Elorge is not responsible for data entered incorrectly by your staff.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">3. The wallet &amp; billing</h2>
        <p className="mb-4">
          Certain features (result PIN generation, computer-based testing) draw from a prepaid wallet balance,
          charged per student per term at the platform's published rate. Wallet funds are non-refundable except
          where a charge failed to deliver the corresponding service (see Refunds).
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">4. Suspension</h2>
        <p className="mb-4">
          Elorge may suspend a School's staff/admin access for non-payment or breach of these terms. Suspension
          does not delete data, and does not block a parent's access to their child's already-generated results
          via a valid PIN.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">5. Availability</h2>
        <p className="mb-4">
          The Platform is provided "as is." We aim for high availability but do not guarantee uninterrupted
          service. Offline features are designed to reduce, not eliminate, the impact of connectivity issues.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">6. Data ownership</h2>
        <p className="mb-4">
          You retain ownership of all data you submit. On account termination, you may request an export of your
          school's data within a reasonable period before deletion.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">7. Changes</h2>
        <p>
          We may update these terms; continued use after a change constitutes acceptance. Material changes will
          be communicated to School Admins.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}