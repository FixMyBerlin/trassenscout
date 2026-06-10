/*
  Warnings:

  - Added the required column `slug` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Subsection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "slug" TEXT NOT NULL;
