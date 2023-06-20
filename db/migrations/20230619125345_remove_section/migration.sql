/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Subsection` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Subsection" DROP CONSTRAINT "Subsection_sectionId_fkey";

-- AlterTable
ALTER TABLE "Subsection" DROP COLUMN "sectionId";

-- DropTable
DROP TABLE "Section";
