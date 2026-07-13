/*
  Warnings:

  - You are about to drop the column `order` on the `Subsubsection` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subsubsection_subsectionId_order_key";

-- AlterTable
ALTER TABLE "Subsubsection" DROP COLUMN "order";
