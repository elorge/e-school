-- AlterTable
ALTER TABLE "assessment_weights" ADD COLUMN     "termId" TEXT;

-- AddForeignKey
ALTER TABLE "assessment_weights" ADD CONSTRAINT "assessment_weights_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
