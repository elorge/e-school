-- 1. HR authority now sits solely with SCHOOL_ADMIN. The per-staff HR flag is retired.
ALTER TABLE "staff_profiles" DROP COLUMN "isHrManager";

-- 2. Extra details a staff member can add about themselves (visible to the school admin).
ALTER TABLE "staff_profiles" ADD COLUMN "nextOfKinRelationship" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "maritalStatus" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "stateOfOrigin" TEXT;
ALTER TABLE "staff_profiles" ADD COLUMN "qualifications" TEXT;

-- 3. Remove junk leave types that were created with a staff member's own name
--    (e.g. "Elohor Olumah"). Only types that were never used in a request are
--    removed, so no leave history can be lost.
DELETE FROM "staff_leave_balances" b
USING "leave_types" t
WHERE b."leaveTypeId" = t."id"
  AND NOT EXISTS (SELECT 1 FROM "leave_requests" r WHERE r."leaveTypeId" = t."id")
  AND EXISTS (SELECT 1 FROM "users" u WHERE u."schoolId" = t."schoolId" AND lower(u."fullName") = lower(t."name"));

DELETE FROM "leave_types" t
WHERE NOT EXISTS (SELECT 1 FROM "leave_requests" r WHERE r."leaveTypeId" = t."id")
  AND EXISTS (SELECT 1 FROM "users" u WHERE u."schoolId" = t."schoolId" AND lower(u."fullName") = lower(t."name"));

-- 4. Make sure every existing school has the standard leave types.
INSERT INTO "leave_types" ("id", "schoolId", "name", "defaultDaysPerYear", "createdAt")
SELECT gen_random_uuid()::text, s."id", d."name", d."days", CURRENT_TIMESTAMP
FROM "schools" s
CROSS JOIN (VALUES
  ('Annual Leave', 21),
  ('Sick Leave', 10),
  ('Compassionate Leave', 5),
  ('Maternity Leave', 90),
  ('Paternity Leave', 5),
  ('Study Leave', 10),
  ('Unpaid Leave', 0)
) AS d("name", "days")
ON CONFLICT ("schoolId", "name") DO NOTHING;
