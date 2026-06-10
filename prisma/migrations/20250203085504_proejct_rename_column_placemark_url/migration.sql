/*
  Warnings:

  - You are about to drop the column `felt_subsection_geometry_source_url` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "felt_subsection_geometry_source_url",
ADD COLUMN     "placemarkUrl" TEXT;
