/*
  Warnings:

  - A unique constraint covering the columns `[projectId,slug]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sectionId,slug]` on the table `Subsection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Section_slug_key";

-- DropIndex
DROP INDEX "Subsection_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Section_projectId_slug_key" ON "Section"("projectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subsection_sectionId_slug_key" ON "Subsection"("sectionId", "slug");
