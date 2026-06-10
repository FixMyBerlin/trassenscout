/*
  Warnings:

  - You are about to drop the column `subsectionId` on the `Upload` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_subsectionId_fkey";

-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "subsectionId";
