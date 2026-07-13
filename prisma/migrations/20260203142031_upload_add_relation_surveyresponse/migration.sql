-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "surveyResponseId" INTEGER;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
