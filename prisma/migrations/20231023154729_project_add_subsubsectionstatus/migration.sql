-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "subsubsectionStatusId" INTEGER;

-- CreateTable
CREATE TABLE "SubsubsectionStatus" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubsubsectionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubsubsectionStatus_projectId_slug_key" ON "SubsubsectionStatus"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_subsubsectionStatusId_fkey" FOREIGN KEY ("subsubsectionStatusId") REFERENCES "SubsubsectionStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsubsectionStatus" ADD CONSTRAINT "SubsubsectionStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
