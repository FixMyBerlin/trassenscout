/*
  Warnings:

  - You are about to drop the column `index` on the `Section` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,order]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sectionId,order]` on the table `Subsection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subsectionId,order]` on the table `Subsubsection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Section_projectId_index_key";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "index",
ADD COLUMN     "order" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "order" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "order" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Section_projectId_order_key" ON "Section"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Subsection_sectionId_order_key" ON "Subsection"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Subsubsection_subsectionId_order_key" ON "Subsubsection"("subsectionId", "order");
