-- AlterEnum
ALTER TYPE "SubsubsectionTypeEnum" RENAME TO "GeometryTypeEnum";

-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN "type" "GeometryTypeEnum" NOT NULL DEFAULT 'LINE';
