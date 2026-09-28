-- AlterEnum
ALTER TYPE "McpDraftKind" ADD VALUE 'PROJECT_RECORD_UPDATE';
ALTER TYPE "McpDraftKind" ADD VALUE 'PROJECT_RECORD_CREATE';

-- AlterTable
ALTER TABLE "McpDraft" ADD COLUMN "projectRecordId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_projectRecordId_key" ON "McpDraft"("projectRecordId");

-- One create-draft per project, kind, and protocol ref.
CREATE UNIQUE INDEX "McpDraft_projectId_kind_slug_partial_key" ON "McpDraft"("projectId", "kind", "slug")
WHERE
  "slug" IS NOT NULL
  AND "parentSubsectionId" IS NULL
  AND "subsectionId" IS NULL
  AND "subsubsectionId" IS NULL
  AND "projectRecordId" IS NULL;

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_projectRecordId_fkey" FOREIGN KEY ("projectRecordId") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
