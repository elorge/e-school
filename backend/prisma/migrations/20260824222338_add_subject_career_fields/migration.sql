-- CreateTable
CREATE TABLE "subject_career_fields" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "subject" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_career_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_career_fields_subject_idx" ON "subject_career_fields"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "subject_career_fields_schoolId_subject_field_key" ON "subject_career_fields"("schoolId", "subject", "field");

-- AddForeignKey
ALTER TABLE "subject_career_fields" ADD CONSTRAINT "subject_career_fields_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
