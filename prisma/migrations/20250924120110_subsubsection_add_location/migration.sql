-- CreateEnum
CREATE TYPE "LocationEnum" AS ENUM ('URBAN', 'RURAL');

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "location" "LocationEnum";
