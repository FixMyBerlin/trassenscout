-- AlterTable
ALTER TABLE "ProtocolEmail" ADD COLUMN "projectId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "ProtocolEmail" ADD CONSTRAINT "ProtocolEmail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
