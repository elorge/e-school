-- CreateEnum
CREATE TYPE "IdCardRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "staff_id_card_requests" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "staffProfileId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "IdCardRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_id_card_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_id_card_requests_schoolId_status_idx" ON "staff_id_card_requests"("schoolId", "status");

-- CreateIndex
CREATE INDEX "staff_id_card_requests_staffProfileId_status_idx" ON "staff_id_card_requests"("staffProfileId", "status");

-- AddForeignKey
ALTER TABLE "staff_id_card_requests" ADD CONSTRAINT "staff_id_card_requests_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_id_card_requests" ADD CONSTRAINT "staff_id_card_requests_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
