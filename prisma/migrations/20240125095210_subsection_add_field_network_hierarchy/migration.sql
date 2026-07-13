-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "networkHierarchyId" INTEGER;

-- CreateTable
CREATE TABLE "NetworkHierarchy" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "NetworkHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetworkHierarchy_projectId_slug_key" ON "NetworkHierarchy"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_networkHierarchyId_fkey" FOREIGN KEY ("networkHierarchyId") REFERENCES "NetworkHierarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkHierarchy" ADD CONSTRAINT "NetworkHierarchy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
