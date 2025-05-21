/*
  Warnings:

  - You are about to drop the `SurveyResponseTopicsOnSurveyResponses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SurveyResponseTopicsOnSurveyResponses" DROP CONSTRAINT "SurveyResponseTopicsOnSurveyResponses_surveyResponseId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResponseTopicsOnSurveyResponses" DROP CONSTRAINT "SurveyResponseTopicsOnSurveyResponses_surveyResponseTopicI_fkey";

-- DropForeignKey
ALTER TABLE "_SurveyResponseToSurveyResponseTopic" DROP CONSTRAINT "_SurveyResponseToSurveyResponseTopic_A_fkey";

-- DropForeignKey
ALTER TABLE "_SurveyResponseToSurveyResponseTopic" DROP CONSTRAINT "_SurveyResponseToSurveyResponseTopic_B_fkey";

-- DropTable
DROP TABLE "SurveyResponseTopicsOnSurveyResponses";

-- AddForeignKey
ALTER TABLE "_SurveyResponseToSurveyResponseTopic" ADD CONSTRAINT "_SurveyResponseToSurveyResponseTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SurveyResponseToSurveyResponseTopic" ADD CONSTRAINT "_SurveyResponseToSurveyResponseTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "SurveyResponseTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
