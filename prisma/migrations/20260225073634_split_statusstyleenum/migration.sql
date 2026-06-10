-- CreateEnum
CREATE TYPE "SubsectionStatusStyleEnum" AS ENUM ('REGULAR', 'DASHED');

-- CreateEnum
CREATE TYPE "SubsubsectionStatusStyleEnum" AS ENUM ('REGULAR', 'GREEN');

-- AlterTable: Update SubsectionStatus.style to use SubsectionStatusStyleEnum
ALTER TABLE "SubsectionStatus" ALTER COLUMN "style" DROP DEFAULT;
ALTER TABLE "SubsectionStatus" ALTER COLUMN "style" TYPE "SubsectionStatusStyleEnum" USING "style"::text::"SubsectionStatusStyleEnum";
ALTER TABLE "SubsectionStatus" ALTER COLUMN "style" SET DEFAULT 'REGULAR';

-- AlterTable: Update SubsubsectionStatus.style to use SubsubsectionStatusStyleEnum
-- Map DASHED -> GREEN for subsubsection statuses
ALTER TABLE "SubsubsectionStatus" ALTER COLUMN "style" DROP DEFAULT;
ALTER TABLE "SubsubsectionStatus" ALTER COLUMN "style" TYPE "SubsubsectionStatusStyleEnum" USING CASE WHEN "style"::text = 'DASHED' THEN 'GREEN'::"SubsubsectionStatusStyleEnum" ELSE "style"::text::"SubsubsectionStatusStyleEnum" END;
ALTER TABLE "SubsubsectionStatus" ALTER COLUMN "style" SET DEFAULT 'REGULAR';

-- DropEnum
DROP TYPE "StatusStyleEnum";
