-- AlterTable: schools — locale drives report card labels, CBT UI copy, and
-- system emails. Defaulted to 'en' so existing rows need no backfill; update
-- them explicitly below if you want existing Francophone schools (CI/SN/CM)
-- switched over immediately rather than opting in later.
ALTER TABLE "schools" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable: school_signup_requests — same default, carried through to the
-- real School row on approval (see SchoolsService.approveSignupRequest).
ALTER TABLE "school_signup_requests" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en';

-- Optional backfill: uncomment and adjust if you want existing schools in
-- Francophone countries switched to French immediately instead of staying
-- on the 'en' default until an admin changes it themselves.
-- UPDATE "schools" SET "locale" = 'fr' WHERE "countryCode" IN ('CI', 'SN', 'CM');
