-- AlterTable
ALTER TABLE "cbt_tests" ADD COLUMN     "componentName" TEXT NOT NULL DEFAULT 'Test',
ADD COLUMN     "countsTowardReport" BOOLEAN NOT NULL DEFAULT true;
