-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_projectId_fkey";

-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "supportDocumentId" INTEGER,
ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey - ON DELETE CASCADE because we want to delete the log entry if the project is deleted
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_supportDocumentId_fkey" FOREIGN KEY ("supportDocumentId") REFERENCES "SupportDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
