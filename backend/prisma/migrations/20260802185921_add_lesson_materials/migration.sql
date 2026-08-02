-- CreateEnum
CREATE TYPE "LessonMaterialType" AS ENUM ('IMAGE', 'PDF_PAGE', 'SLIDE');

-- CreateTable
CREATE TABLE "LessonMaterial" (
    "id" TEXT NOT NULL,
    "lessonNoteId" TEXT NOT NULL,
    "type" "LessonMaterialType" NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "insertAfter" TEXT NOT NULL,
    "originalFilename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonMaterial_lessonNoteId_idx" ON "LessonMaterial"("lessonNoteId");

-- AddForeignKey
ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_lessonNoteId_fkey" FOREIGN KEY ("lessonNoteId") REFERENCES "lesson_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
