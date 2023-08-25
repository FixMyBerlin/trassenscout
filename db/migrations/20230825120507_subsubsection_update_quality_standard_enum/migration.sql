/*
  Warnings:

  - The values [ERA] on the enum `QualityStandardEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QualityStandardEnum_new" AS ENUM ('RSV', 'RVR', 'RNBW', 'NO');
ALTER TABLE "Subsubsection" ALTER COLUMN "qualityStandard" DROP DEFAULT;
ALTER TABLE "Subsubsection" ALTER COLUMN "qualityStandard" TYPE "QualityStandardEnum_new" USING ("qualityStandard"::text::"QualityStandardEnum_new");
ALTER TYPE "QualityStandardEnum" RENAME TO "QualityStandardEnum_old";
ALTER TYPE "QualityStandardEnum_new" RENAME TO "QualityStandardEnum";
DROP TYPE "QualityStandardEnum_old";
ALTER TABLE "Subsubsection" ALTER COLUMN "qualityStandard" SET DEFAULT 'NO';
COMMIT;
