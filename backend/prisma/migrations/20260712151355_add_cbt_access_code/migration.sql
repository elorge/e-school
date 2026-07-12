/*
  Warnings:

  - A unique constraint covering the columns `[accessCode]` on the table `cbt_tests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cbt_tests" ADD COLUMN     "accessCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cbt_tests_accessCode_key" ON "cbt_tests"("accessCode");
