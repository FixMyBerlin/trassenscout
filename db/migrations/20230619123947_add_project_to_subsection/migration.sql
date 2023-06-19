/*
  Warnings:

  - A unique constraint covering the columns `[projectId,slug]` on the table `Subsection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,order]` on the table `Subsection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Subsection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subsection" DROP CONSTRAINT "Subsection_sectionId_fkey";

-- DropIndex
DROP INDEX "Subsection_sectionId_order_key";

-- DropIndex
DROP INDEX "Subsection_sectionId_slug_key";

-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "projectId" INTEGER NOT NULL,
ALTER COLUMN "sectionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subsection_projectId_slug_key" ON "Subsection"("projectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subsection_projectId_order_key" ON "Subsection"("projectId", "order");

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
