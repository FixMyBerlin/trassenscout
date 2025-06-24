-- create new implicit relation table
CREATE TABLE "_SurveyResponseToSurveyResponseTopic" (
    "A" integer NOT NULL REFERENCES "SurveyResponse"(id) ON DELETE CASCADE,
    "B" integer NOT NULL REFERENCES "SurveyResponseTopic"(id) ON DELETE CASCADE
);

-- copy data from the existing relation table
INSERT INTO "_SurveyResponseToSurveyResponseTopic" ("A", "B")
SELECT "surveyResponseId", "surveyResponseTopicId"
FROM "SurveyResponseTopicsOnSurveyResponses";

-- create unique index for the relation table (required by Prisma)
-- https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations
CREATE UNIQUE INDEX "_SurveyResponseToSurveyResponseTopic_AB_unique"
ON "_SurveyResponseToSurveyResponseTopic"("A" int4_ops, "B" int4_ops);

-- create index (required by Prisma)
CREATE INDEX "_SurveyResponseToSurveyResponseTopic_B_index"
ON "_SurveyResponseToSurveyResponseTopic"("B" int4_ops);

