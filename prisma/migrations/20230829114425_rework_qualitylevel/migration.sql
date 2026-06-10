/*
  Warnings:

  - You are about to drop the column `qualityStandard` on the `Subsubsection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subsubsection" DROP COLUMN "qualityStandard",
ADD COLUMN     "qualityLevelId" INTEGER;

-- DropEnum
DROP TYPE "QualityStandardEnum";

-- CreateTable
CREATE TABLE "QualityLevel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "QualityLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QualityLevel_projectId_slug_key" ON "QualityLevel"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_qualityLevelId_fkey" FOREIGN KEY ("qualityLevelId") REFERENCES "QualityLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityLevel" ADD CONSTRAINT "QualityLevel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
