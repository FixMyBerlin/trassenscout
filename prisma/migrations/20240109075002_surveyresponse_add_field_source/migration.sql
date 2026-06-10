-- CreateEnum
CREATE TYPE "SurveyResponseSourceEnum" AS ENUM ('EMAIL', 'LETTER', 'FORM');

-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN     "source" "SurveyResponseSourceEnum" NOT NULL DEFAULT 'FORM';
