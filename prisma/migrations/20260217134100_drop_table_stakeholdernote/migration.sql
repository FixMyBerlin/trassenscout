-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_stakeholdernoteId_fkey";

-- DropForeignKey
ALTER TABLE "Stakeholdernote" DROP CONSTRAINT "Stakeholdernote_subsectionId_fkey";

-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "stakeholdernoteId";

-- DropTable
DROP TABLE "Stakeholdernote";

-- DropEnum
DROP TYPE "StakeholdernoteStatusEnum";
