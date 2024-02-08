/*
  Warnings:

  - You are about to drop the column `quarterPlannedCompletion` on the `Subsubsection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subsubsection" DROP COLUMN "quarterPlannedCompletion",
ADD COLUMN     "estimatedCompletionDate" TIMESTAMP(3);
