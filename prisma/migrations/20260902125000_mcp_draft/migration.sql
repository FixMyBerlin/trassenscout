-- CreateEnum
CREATE TYPE "McpDraftKind" AS ENUM ('SUBSUBSECTION_UPDATE', 'SUBSUBSECTION_CREATE', 'SUBSECTION_UPDATE', 'SUBSECTION_CREATE');

-- CreateTable
CREATE TABLE "McpDraft" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "kind" "McpDraftKind" NOT NULL,
    "subsubsectionId" INTEGER,
    "parentSubsectionId" INTEGER,
    "slug" TEXT,
    "subsectionId" INTEGER,
    "patch" JSONB NOT NULL,

    CONSTRAINT "McpDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_subsubsectionId_key" ON "McpDraft"("subsubsectionId");

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_subsectionId_key" ON "McpDraft"("subsectionId");

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_parentSubsectionId_slug_key" ON "McpDraft"("parentSubsectionId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_subsection_create_projectId_slug_key" ON "McpDraft"("projectId", "slug") WHERE "kind" = 'SUBSECTION_CREATE';

-- CreateIndex
CREATE INDEX "McpDraft_projectId_idx" ON "McpDraft"("projectId");

-- CreateIndex
CREATE INDEX "McpDraft_updatedAt_idx" ON "McpDraft"("updatedAt");

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_parentSubsectionId_fkey" FOREIGN KEY ("parentSubsectionId") REFERENCES "Subsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "McpDraft" ADD CONSTRAINT "McpDraft_kind_identity_check" CHECK (
  (
    "kind" = 'SUBSUBSECTION_UPDATE'
    AND "subsubsectionId" IS NOT NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NULL
    AND "slug" IS NULL
  )
  OR (
    "kind" = 'SUBSUBSECTION_CREATE'
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NOT NULL
    AND "subsectionId" IS NULL
    AND "slug" IS NOT NULL
  )
  OR (
    "kind" = 'SUBSECTION_UPDATE'
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NOT NULL
    AND "slug" IS NULL
  )
  OR (
    "kind" = 'SUBSECTION_CREATE'
    AND "subsubsectionId" IS NULL
    AND "parentSubsectionId" IS NULL
    AND "subsectionId" IS NULL
    AND "slug" IS NOT NULL
  )
);
