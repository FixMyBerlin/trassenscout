/*
  Warnings:

  - Made the column `lengthKm` on table `Subsection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lengthKm` on table `Subsubsection` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subsection" ALTER COLUMN "lengthKm" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subsubsection" ALTER COLUMN "lengthKm" SET NOT NULL;
