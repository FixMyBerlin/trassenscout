/*
  Warnings:

  - The primary key for the `_ProjectRecordAcquisitionAreas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_ProjectRecordSubsubsections` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectRecordAcquisitionAreas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectRecordSubsubsections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_ProjectRecordAcquisitionAreas" DROP CONSTRAINT "_ProjectRecordAcquisitionAreas_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectRecordAcquisitionAreas" DROP CONSTRAINT "_ProjectRecordAcquisitionAreas_B_fkey";

-- AlterTable
ALTER TABLE "_ProjectRecordAcquisitionAreas" DROP CONSTRAINT "_ProjectRecordAcquisitionAreas_AB_pkey";

-- AlterTable
ALTER TABLE "_ProjectRecordSubsubsections" DROP CONSTRAINT "_ProjectRecordSubsubsections_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectRecordAcquisitionAreas_AB_unique" ON "_ProjectRecordAcquisitionAreas"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectRecordSubsubsections_AB_unique" ON "_ProjectRecordSubsubsections"("A", "B");

-- AddForeignKey
ALTER TABLE "_ProjectRecordAcquisitionAreas" ADD CONSTRAINT "_ProjectRecordAcquisitionAreas_A_fkey" FOREIGN KEY ("A") REFERENCES "AcquisitionArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordAcquisitionAreas" ADD CONSTRAINT "_ProjectRecordAcquisitionAreas_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
