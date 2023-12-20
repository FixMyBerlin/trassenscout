-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "subsubsectionTaskId" INTEGER;

-- CreateTable
CREATE TABLE "SubsubsectionTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubsubsectionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubsubsectionTask_projectId_slug_key" ON "SubsubsectionTask"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_subsubsectionTaskId_fkey" FOREIGN KEY ("subsubsectionTaskId") REFERENCES "SubsubsectionTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsubsectionTask" ADD CONSTRAINT "SubsubsectionTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
