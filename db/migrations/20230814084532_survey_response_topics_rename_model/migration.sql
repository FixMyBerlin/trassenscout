/*
  Warnings:

  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopicsOnSurveyResponses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TopicsOnSurveyResponses" DROP CONSTRAINT "TopicsOnSurveyResponses_surveyResponseId_fkey";

-- DropForeignKey
ALTER TABLE "TopicsOnSurveyResponses" DROP CONSTRAINT "TopicsOnSurveyResponses_topicId_fkey";

-- DropTable
DROP TABLE "Topic";

-- DropTable
DROP TABLE "TopicsOnSurveyResponses";

-- CreateTable
CREATE TABLE "SurveyResponseTopic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SurveyResponseTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponseTopicsOnSurveyResponses" (
    "surveyResponseId" INTEGER NOT NULL,
    "surveyResponseTopicId" INTEGER NOT NULL,

    CONSTRAINT "SurveyResponseTopicsOnSurveyResponses_pkey" PRIMARY KEY ("surveyResponseId","surveyResponseTopicId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponseTopic_title_projectId_key" ON "SurveyResponseTopic"("title", "projectId");

-- AddForeignKey
ALTER TABLE "SurveyResponseTopic" ADD CONSTRAINT "SurveyResponseTopic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseTopicsOnSurveyResponses" ADD CONSTRAINT "SurveyResponseTopicsOnSurveyResponses_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseTopicsOnSurveyResponses" ADD CONSTRAINT "SurveyResponseTopicsOnSurveyResponses_surveyResponseTopicI_fkey" FOREIGN KEY ("surveyResponseTopicId") REFERENCES "SurveyResponseTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
