/*
  Warnings:

  - A unique constraint covering the columns `[projectId,index]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `index` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "index" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Section_projectId_index_key" ON "Section"("projectId", "index");
