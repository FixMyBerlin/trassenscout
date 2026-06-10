/*
  Warnings:

  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Subsection` table. All the data in the column will be lost.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Subsection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project"
DROP COLUMN "name",
DROP COLUMN "shortName",
ADD COLUMN     "shortTitle" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Section"
DROP COLUMN "name",
ADD COLUMN     "subTitle" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subsection"
DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
