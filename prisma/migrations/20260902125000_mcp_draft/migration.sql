-- CreateTable
CREATE TABLE "McpDraft" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "subsubsectionId" INTEGER,
    "patch" JSONB NOT NULL,

    CONSTRAINT "McpDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McpDraft_subsubsectionId_key" ON "McpDraft"("subsubsectionId");

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
