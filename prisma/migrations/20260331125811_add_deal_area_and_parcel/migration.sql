-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "landAcquisitionModuleEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "hasLandAcquisition" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Parcel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealArea" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "geometry" JSONB NOT NULL,
    "acquisitionComplexity" INTEGER,
    "description" TEXT,
    "subsubsectionId" INTEGER NOT NULL,
    "parcelId" INTEGER,

    CONSTRAINT "DealArea_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DealArea" ADD CONSTRAINT "DealArea_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealArea" ADD CONSTRAINT "DealArea_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
