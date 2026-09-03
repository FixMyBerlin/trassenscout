-- AlterTable
ALTER TABLE "McpDraft" ADD COLUMN "subsectionId" INTEGER;
ALTER TABLE "McpDraft" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_subsectionId_slug_key" ON "McpDraft"("subsectionId", "slug");

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
