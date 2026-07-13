-- DropForeignKey
ALTER TABLE "DealArea" DROP CONSTRAINT "DealArea_parcelId_fkey";

-- AlterTable
ALTER TABLE "DealArea"
DROP COLUMN "acquisitionComplexity",
ADD COLUMN     "dealAreaStatusId" INTEGER,
ALTER COLUMN "parcelId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "officialId" TEXT;

-- AlterTable
ALTER TABLE "Subsubsection" DROP COLUMN "hasLandAcquisition";

-- CreateTable
CREATE TABLE "DealAreaStatus" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "style" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "DealAreaStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealAreaStatus_projectId_slug_key" ON "DealAreaStatus"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "DealAreaStatus" ADD CONSTRAINT "DealAreaStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealArea" ADD CONSTRAINT "DealArea_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealArea" ADD CONSTRAINT "DealArea_dealAreaStatusId_fkey" FOREIGN KEY ("dealAreaStatusId") REFERENCES "DealAreaStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
