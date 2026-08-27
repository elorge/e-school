/*
  Warnings:

  - Added the required column `timezone` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add nullable first
ALTER TABLE "schools" ADD COLUMN "timezone" TEXT;

-- Backfill from countryCode
UPDATE "schools" SET "timezone" = CASE "countryCode"
  WHEN 'NG' THEN 'Africa/Lagos'
  WHEN 'GH' THEN 'Africa/Accra'
  WHEN 'KE' THEN 'Africa/Nairobi'
  WHEN 'ZA' THEN 'Africa/Johannesburg'
  WHEN 'UG' THEN 'Africa/Kampala'
  WHEN 'TZ' THEN 'Africa/Dar_es_Salaam'
  WHEN 'RW' THEN 'Africa/Kigali'
  WHEN 'CI' THEN 'Africa/Abidjan'
  WHEN 'SN' THEN 'Africa/Dakar'
  WHEN 'CM' THEN 'Africa/Douala'
  WHEN 'US' THEN 'America/New_York'
  WHEN 'GB' THEN 'Europe/London'
  ELSE NULL
END
WHERE "timezone" IS NULL;

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "schools" ALTER COLUMN "timezone" SET NOT NULL;