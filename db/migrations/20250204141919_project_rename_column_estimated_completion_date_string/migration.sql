/*
  Warnings:

  - You are about to drop the column `estimatedCompletionDate` on the `Subsection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subsection" DROP COLUMN "estimatedCompletionDate",
ADD COLUMN     "estimatedCompletionDateString" TEXT;
