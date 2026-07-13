-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "subsubsectionInfrastructureTypeId" INTEGER;

-- CreateTable
CREATE TABLE "SubsubsectionInfrastructureType" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubsubsectionInfrastructureType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubsubsectionInfrastructureType_projectId_slug_key" ON "SubsubsectionInfrastructureType"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_subsubsectionInfrastructureTypeId_fkey" FOREIGN KEY ("subsubsectionInfrastructureTypeId") REFERENCES "SubsubsectionInfrastructureType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsubsectionInfrastructureType" ADD CONSTRAINT "SubsubsectionInfrastructureType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
