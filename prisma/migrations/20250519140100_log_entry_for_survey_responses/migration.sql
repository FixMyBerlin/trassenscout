/*
  Warnings:

  - You are about to drop the column `surveyId` on the `LogEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_surveyId_fkey";

-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "surveyId",
ADD COLUMN     "surveyResponseId" INTEGER;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
