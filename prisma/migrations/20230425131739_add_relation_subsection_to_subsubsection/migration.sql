/*
  Warnings:

  - Added the required column `subsectionId` to the `Subsubsection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "subsectionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
