/*
  Warnings:

  - Added the required column `countryCode` to the `school_signup_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `school_signup_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `wallet_ledger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "platform_expenses" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN';

-- AlterTable: school_signup_requests — add nullable first
ALTER TABLE "school_signup_requests" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "currency" TEXT;

-- AlterTable: schools — add nullable first
ALTER TABLE "schools" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "currency" TEXT;

-- AlterTable: wallet_ledger — add nullable first
ALTER TABLE "wallet_ledger" ADD COLUMN     "currency" TEXT;

-- Backfill: schools
-- >>> Replace 'NG' / 'NGN' below with the ACTUAL country/currency
-- >>> for your existing school row before running this. <
UPDATE "schools" SET "countryCode" = 'NG', "currency" = 'NGN' WHERE "countryCode" IS NULL;

-- Backfill: school_signup_requests
-- Any pending/reviewed signup rows predate this feature — back-date them
-- to the same default. Adjust if you know better values per row.
UPDATE "school_signup_requests" SET "countryCode" = 'NG', "currency" = 'NGN' WHERE "countryCode" IS NULL;

-- Backfill: wallet_ledger — mirror the owning school's currency,
-- per the schema comment ("copied from School.currency at creation time")
UPDATE "wallet_ledger" AS w
SET "currency" = s."currency"
FROM "schools" AS s
WHERE w."schoolId" = s."id" AND w."currency" IS NULL;

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "school_signup_requests" ALTER COLUMN "countryCode" SET NOT NULL;
ALTER TABLE "school_signup_requests" ALTER COLUMN "currency" SET NOT NULL;
ALTER TABLE "schools" ALTER COLUMN "countryCode" SET NOT NULL;
ALTER TABLE "schools" ALTER COLUMN "currency" SET NOT NULL;
ALTER TABLE "wallet_ledger" ALTER COLUMN "currency" SET NOT NULL;

-- CreateIndex
CREATE INDEX "platform_expenses_currency_incurredAt_idx" ON "platform_expenses"("currency", "incurredAt");

-- CreateIndex
CREATE INDEX "wallet_ledger_currency_type_status_createdAt_idx" ON "wallet_ledger"("currency", "type", "status", "createdAt");