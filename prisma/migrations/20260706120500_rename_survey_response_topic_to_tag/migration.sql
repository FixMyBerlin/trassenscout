/*
  Rename SurveyResponseTopic → SurveyResponseTag in place.
  Join table: _SurveyResponseToSurveyResponseTag
*/

ALTER TABLE "_SurveyResponseToSurveyResponseTopic"
DROP CONSTRAINT "_SurveyResponseToSurveyResponseTopic_A_fkey";

ALTER TABLE "_SurveyResponseToSurveyResponseTopic"
DROP CONSTRAINT "_SurveyResponseToSurveyResponseTopic_B_fkey";

ALTER TABLE "SurveyResponseTopic"
DROP CONSTRAINT "SurveyResponseTopic_projectId_fkey";

ALTER TABLE "SurveyResponseTopic" RENAME TO "SurveyResponseTag";

ALTER TABLE "SurveyResponseTag"
RENAME CONSTRAINT "SurveyResponseTopic_pkey" TO "SurveyResponseTag_pkey";

ALTER INDEX "SurveyResponseTopic_title_projectId_key"
RENAME TO "SurveyResponseTag_title_projectId_key";

ALTER TABLE "_SurveyResponseToSurveyResponseTopic"
RENAME TO "_SurveyResponseToSurveyResponseTag";

ALTER TABLE "_SurveyResponseToSurveyResponseTag"
RENAME CONSTRAINT "_SurveyResponseToSurveyResponseTopic_AB_pkey" TO "_SurveyResponseToSurveyResponseTag_AB_pkey";

ALTER INDEX "_SurveyResponseToSurveyResponseTopic_B_index"
RENAME TO "_SurveyResponseToSurveyResponseTag_B_index";

ALTER TABLE "SurveyResponseTag"
ADD CONSTRAINT "SurveyResponseTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "_SurveyResponseToSurveyResponseTag"
ADD CONSTRAINT "_SurveyResponseToSurveyResponseTag_A_fkey" FOREIGN KEY ("A") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_SurveyResponseToSurveyResponseTag"
ADD CONSTRAINT "_SurveyResponseToSurveyResponseTag_B_fkey" FOREIGN KEY ("B") REFERENCES "SurveyResponseTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
