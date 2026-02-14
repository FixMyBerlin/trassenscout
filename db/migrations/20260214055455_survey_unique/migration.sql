/*
Warnings: A unique constraint covering the columns `[surveySessionId,surveyPart,state]` on the table `SurveyResponse` will be added. If there are existing duplicate values, this will fail.
*/
-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_surveySessionId_surveyPart_state_key" ON "SurveyResponse" ("surveySessionId", "surveyPart", "state");
