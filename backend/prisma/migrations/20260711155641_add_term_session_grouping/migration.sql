/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,academicSession,termNumber]` on the table `terms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicSession` to the `terms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termNumber` to the `terms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "terms" ADD COLUMN     "academicSession" TEXT NOT NULL,
ADD COLUMN     "termNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "terms_schoolId_academicSession_idx" ON "terms"("schoolId", "academicSession");

-- CreateIndex
CREATE UNIQUE INDEX "terms_schoolId_academicSession_termNumber_key" ON "terms"("schoolId", "academicSession", "termNumber");
