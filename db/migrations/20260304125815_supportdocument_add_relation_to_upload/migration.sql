-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_projectId_fkey";

-- AlterTable
ALTER TABLE "SupportDocument" DROP COLUMN "externalUrl",
DROP COLUMN "fileSize",
DROP COLUMN "mimeType";

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "supportDocumentId" INTEGER,
ALTER COLUMN "projectId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Upload_supportDocumentId_key" ON "Upload"("supportDocumentId");

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_supportDocumentId_fkey" FOREIGN KEY ("supportDocumentId") REFERENCES "SupportDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
