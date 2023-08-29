-- CreateEnum
CREATE TYPE "QualityStandardEnum" AS ENUM ('RSV', 'RVR', 'RNBW', 'ERA', 'NO');

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "qualityStandard" "QualityStandardEnum" NOT NULL DEFAULT 'NO';
