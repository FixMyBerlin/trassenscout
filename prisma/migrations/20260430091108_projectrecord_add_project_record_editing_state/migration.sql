-- CreateEnum
CREATE TYPE "ProjectRecordEditingState" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "ProjectRecord" ADD COLUMN     "editingState" "ProjectRecordEditingState" NOT NULL DEFAULT 'PENDING';
