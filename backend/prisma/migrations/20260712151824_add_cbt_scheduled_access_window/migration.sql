/*
  Warnings:

  - Added the required column `scheduledDate` to the `cbt_tests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cbt_tests" ADD COLUMN     "accessWindowMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL;
