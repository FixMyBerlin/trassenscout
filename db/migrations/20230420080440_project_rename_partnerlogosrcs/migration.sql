/*
  Warnings:

  - You are about to drop the column `partnerLogoSrc` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "partnerLogoSrc",
ADD COLUMN     "partnerLogoSrcs" TEXT[];
