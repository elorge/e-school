/*
  Warnings:

  - You are about to drop the column `startedAt` on the `cbt_attempts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cbt_attempts" DROP COLUMN "startedAt",
ADD COLUMN     "beginAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
