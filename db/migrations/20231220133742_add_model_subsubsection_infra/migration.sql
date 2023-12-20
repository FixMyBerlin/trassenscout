-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "subsubsectionInfraId" INTEGER;

-- CreateTable
CREATE TABLE "SubsubsectionInfra" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubsubsectionInfra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubsubsectionInfra_projectId_slug_key" ON "SubsubsectionInfra"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_subsubsectionInfraId_fkey" FOREIGN KEY ("subsubsectionInfraId") REFERENCES "SubsubsectionInfra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsubsectionInfra" ADD CONSTRAINT "SubsubsectionInfra_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
