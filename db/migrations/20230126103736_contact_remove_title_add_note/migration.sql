/*
  Warnings:

  - You are about to drop the column `title` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "title",
ADD COLUMN     "note" TEXT;
