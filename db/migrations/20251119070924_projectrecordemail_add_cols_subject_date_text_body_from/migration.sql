-- AlterTable
ALTER TABLE "ProjectRecordEmail" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "from" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "textBody" TEXT;
