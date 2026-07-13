/*
  Warnings:

  - A unique constraint covering the columns `[subsectionId,slug]` on the table `Subsubsection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subsubsection_subsectionId_slug_key" ON "Subsubsection"("subsectionId", "slug");
