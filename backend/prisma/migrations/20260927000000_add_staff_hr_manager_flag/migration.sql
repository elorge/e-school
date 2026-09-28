-- Grants HR-level access (Staff Directory, Payroll, Leave administration)
-- to an individual STAFF account without making them a full SCHOOL_ADMIN.
-- Defaults to false for every existing row, so nobody gains access
-- silently when this migration runs.
ALTER TABLE "staff_profiles" ADD COLUMN "isHrManager" BOOLEAN NOT NULL DEFAULT false;
