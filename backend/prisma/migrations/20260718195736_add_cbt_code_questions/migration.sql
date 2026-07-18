-- CreateEnum
CREATE TYPE "CbtQuestionType" AS ENUM ('OBJECTIVE', 'CODE');

-- AlterTable
ALTER TABLE "cbt_questions" ADD COLUMN     "starterCss" TEXT,
ADD COLUMN     "starterHtml" TEXT,
ADD COLUMN     "starterJs" TEXT,
ADD COLUMN     "testAssertions" JSONB,
ADD COLUMN     "type" "CbtQuestionType" NOT NULL DEFAULT 'OBJECTIVE',
ALTER COLUMN "options" DROP NOT NULL,
ALTER COLUMN "correctOptionIndex" DROP NOT NULL;
