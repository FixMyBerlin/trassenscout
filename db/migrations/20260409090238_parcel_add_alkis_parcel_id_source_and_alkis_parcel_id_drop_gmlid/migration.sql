/*
  Warnings:

  - You are about to drop the column `gmlId` on the `Parcel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alkisParcelId]` on the table `Parcel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alkisParcelId` to the `Parcel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alkisParcelIdSource` to the `Parcel` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Parcel_gmlId_key";

-- AlterTable
ALTER TABLE "Parcel" DROP COLUMN "gmlId",
ADD COLUMN     "alkisParcelId" TEXT NOT NULL,
ADD COLUMN     "alkisParcelIdSource" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_alkisParcelId_key" ON "Parcel"("alkisParcelId");
