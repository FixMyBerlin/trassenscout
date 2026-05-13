/*
  Migrates `Upload.subsubsectionId` into the implicit many-to-many join table
  `_SubsubsectionToUpload` (`A` = Subsubsection, `B` = Upload) before dropping the column.
*/

-- CreateTable
CREATE TABLE "_SubsubsectionToUpload" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubsubsectionToUpload_AB_unique" ON "_SubsubsectionToUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_SubsubsectionToUpload_B_index" ON "_SubsubsectionToUpload"("B");

-- AddForeignKey
ALTER TABLE "_SubsubsectionToUpload" ADD CONSTRAINT "_SubsubsectionToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubsubsectionToUpload" ADD CONSTRAINT "_SubsubsectionToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy existing Upload ↔ Subsubsection links into the join table
INSERT INTO "_SubsubsectionToUpload" ("A", "B")
SELECT u."subsubsectionId", u."id"
FROM "Upload" u
WHERE u."subsubsectionId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_subsubsectionId_fkey";

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "subsubsectionId";
