ALTER TABLE "Survey"
DROP COLUMN "surveyUrl";

ALTER TABLE "Survey"
RENAME COLUMN "externalUrlSurveyResults" TO "surveyResultsUrl";
