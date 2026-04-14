/*
  Warnings:

  - You are about to drop the column `dealAreaId` on the `ProjectRecord` table. All the data in the column will be lost.
  - You are about to drop the column `dealAreaId` on the `Upload` table. All the data in the column will be lost.
  - You are about to drop the `DealArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DealAreaStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DealArea" DROP CONSTRAINT "DealArea_dealAreaStatusId_fkey";

-- DropForeignKey
ALTER TABLE "DealArea" DROP CONSTRAINT "DealArea_parcelId_fkey";

-- DropForeignKey
ALTER TABLE "DealArea" DROP CONSTRAINT "DealArea_subsubsectionId_fkey";

-- DropForeignKey
ALTER TABLE "DealAreaStatus" DROP CONSTRAINT "DealAreaStatus_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRecord" DROP CONSTRAINT "ProjectRecord_dealAreaId_fkey";

-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_dealAreaId_fkey";

-- AlterTable
ALTER TABLE "ProjectRecord" DROP COLUMN "dealAreaId",
ADD COLUMN     "acquisitionAreaId" INTEGER;

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "dealAreaId",
ADD COLUMN     "acquisitionAreaId" INTEGER;

-- DropTable
DROP TABLE "DealArea";

-- DropTable
DROP TABLE "DealAreaStatus";

-- CreateTable
CREATE TABLE "AcquisitionAreaStatus" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "style" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "AcquisitionAreaStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcquisitionArea" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "geometry" JSONB NOT NULL,
    "description" TEXT,
    "subsubsectionId" INTEGER NOT NULL,
    "parcelId" INTEGER NOT NULL,
    "acquisitionAreaStatusId" INTEGER,

    CONSTRAINT "AcquisitionArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcquisitionAreaStatus_projectId_slug_key" ON "AcquisitionAreaStatus"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "AcquisitionAreaStatus" ADD CONSTRAINT "AcquisitionAreaStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionArea" ADD CONSTRAINT "AcquisitionArea_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionArea" ADD CONSTRAINT "AcquisitionArea_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionArea" ADD CONSTRAINT "AcquisitionArea_acquisitionAreaStatusId_fkey" FOREIGN KEY ("acquisitionAreaStatusId") REFERENCES "AcquisitionAreaStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_acquisitionAreaId_fkey" FOREIGN KEY ("acquisitionAreaId") REFERENCES "AcquisitionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_acquisitionAreaId_fkey" FOREIGN KEY ("acquisitionAreaId") REFERENCES "AcquisitionArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
