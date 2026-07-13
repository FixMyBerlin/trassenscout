-- CreateTable
CREATE TABLE "SurveyResponseComment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "surveyResponseId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "SurveyResponseComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SurveyResponseComment"
ADD CONSTRAINT "SurveyResponseComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponseComment"
ADD CONSTRAINT "SurveyResponseComment_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
