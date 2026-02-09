-- CreateEnum
CREATE TYPE "SurveyResponseStateEnum" AS ENUM ('CREATED', 'SUBMITTED');

-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN     "state" "SurveyResponseStateEnum" NOT NULL DEFAULT 'SUBMITTED';
