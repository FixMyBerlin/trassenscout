-- CreateEnum
CREATE TYPE "SurveyResponseStatusEnum" AS ENUM ('PENDING', 'ASSIGNED', 'DONE_FAQ', 'DONE_PLANING', 'IRRELEVANT');

-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN     "note" TEXT,
ADD COLUMN     "status" "SurveyResponseStatusEnum" DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicsOnSurveyResponses" (
    "surveyResponseId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "TopicsOnSurveyResponses_pkey" PRIMARY KEY ("surveyResponseId","topicId")
);

-- AddForeignKey
ALTER TABLE "TopicsOnSurveyResponses" ADD CONSTRAINT "TopicsOnSurveyResponses_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicsOnSurveyResponses" ADD CONSTRAINT "TopicsOnSurveyResponses_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
