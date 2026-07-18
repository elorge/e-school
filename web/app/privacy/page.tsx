// web/app/privacy/page.tsx
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 text-sm text-ink/80">
        <h1 className="mb-2 font-display text-3xl font-semibold text-ink">Privacy Policy</h1>
        <p className="mb-8 text-xs text-ink/50">Last updated: [DATE] — Elorge Technologies Limited</p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">1. What we collect</h2>
        <p className="mb-4">
          To operate Elorge Schools, participating schools submit personal data about students (name, date of
          birth/admission year, class, photograph, academic results, attendance records) and staff/guardians
          (name, email, phone number where provided). We also process payment records tied to a school's wallet,
          not to individual parents directly, unless a parent's own name/phone is entered by the school as part of
          a fee record.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">2. Who controls this data</h2>
        <p className="mb-4">
          Each school is the data controller for its own students' and staff's records under the Nigeria Data
          Protection Act (NDPA) — schools are responsible for having lawful basis (parental/guardian consent or
          legitimate educational interest) to submit student data to us. Elorge Technologies Limited acts as a
          data processor, storing and processing this data on the school's behalf and instruction.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">3. How we use it</h2>
        <p className="mb-4">
          Data is used solely to provide the platform's functions: generating results, ID cards, attendance
          records, fee invoices, and related school-management features. We do not sell student or staff data to
          third parties, and we do not use student data for advertising.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">4. Where data is stored</h2>
        <p className="mb-4">
          Application data is stored on Supabase (PostgreSQL). Uploaded images (student photos, school logos,
          signatures) are stored on Cloudinary. Both are third-party infrastructure providers bound by their own
          security commitments; neither is authorized to use this data for their own purposes.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">5. Retention</h2>
        <p className="mb-4">
          Academic records are retained for as long as a school's account remains active, plus a reasonable period
          after account closure to allow the school to export or transfer records. A suspended school's data is
          not deleted — suspension restricts access, it does not destroy data.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">6. A guardian's rights</h2>
        <p className="mb-4">
          A parent or guardian who wants a student's data corrected or removed should contact their school
          directly, as the school controls that data. Schools can reach us at hello@elorgeschools.com for any
          data-processing requests they need help fulfilling.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">7. Security</h2>
        <p className="mb-4">
          Passwords are hashed, never stored in plaintext. Result PINs are hashed. Access to any school's data is
          restricted to that school's own authenticated staff, plus Elorge platform staff for support purposes.
        </p>

        <h2 className="mb-2 mt-8 font-display text-lg font-semibold text-ink">8. Contact</h2>
        <p>
          Questions about this policy: <a href="mailto:hello@elorgeschools.com" className="text-brand-blue underline">hello@elorgeschools.com</a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}