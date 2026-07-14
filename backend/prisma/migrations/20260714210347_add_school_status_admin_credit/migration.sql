-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "LedgerSource" ADD VALUE 'ADMIN_CREDIT';

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "status" "SchoolStatus" NOT NULL DEFAULT 'ACTIVE';
