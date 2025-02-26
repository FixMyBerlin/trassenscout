/*
  Warnings:

  - You are about to drop the column `isExportApi` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "isExportApi",
ADD COLUMN     "exportEnabled" BOOLEAN NOT NULL DEFAULT false;
