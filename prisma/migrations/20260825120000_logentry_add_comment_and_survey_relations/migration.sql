-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "projectRecordCommentId" INTEGER,
ADD COLUMN     "surveyId" INTEGER,
ADD COLUMN     "surveyResponseCommentId" INTEGER;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_projectRecordCommentId_fkey" FOREIGN KEY ("projectRecordCommentId") REFERENCES "ProjectRecordComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_surveyResponseCommentId_fkey" FOREIGN KEY ("surveyResponseCommentId") REFERENCES "SurveyResponseComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
