ALTER TABLE "SurveySession" ADD COLUMN     "surveyId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SurveySession" ADD CONSTRAINT "SurveySession_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SurveySession" ALTER COLUMN "surveyId" DROP DEFAULT;