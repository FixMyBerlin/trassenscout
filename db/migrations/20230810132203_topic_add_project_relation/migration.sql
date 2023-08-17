/*
  Warnings:

  - Added the required column `projectId` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
