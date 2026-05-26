/*
  Migrates `Upload.acquisitionAreaId` into the implicit many-to-many join table
  `_AcquisitionAreaToUpload` (`A` = AcquisitionArea, `B` = Upload) before dropping the column.
*/

-- CreateTable
CREATE TABLE "_AcquisitionAreaToUpload" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AcquisitionAreaToUpload_AB_unique" ON "_AcquisitionAreaToUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_AcquisitionAreaToUpload_B_index" ON "_AcquisitionAreaToUpload"("B");

-- AddForeignKey
ALTER TABLE "_AcquisitionAreaToUpload" ADD CONSTRAINT "_AcquisitionAreaToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "AcquisitionArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcquisitionAreaToUpload" ADD CONSTRAINT "_AcquisitionAreaToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy existing Upload ↔ AcquisitionArea links into the join table
INSERT INTO "_AcquisitionAreaToUpload" ("A", "B")
SELECT u."acquisitionAreaId", u."id"
FROM "Upload" u
WHERE u."acquisitionAreaId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_acquisitionAreaId_fkey";

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "acquisitionAreaId";
