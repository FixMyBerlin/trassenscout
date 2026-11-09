-- AlterTable
ALTER TABLE "ProjectRecordEmail" ADD COLUMN "discardedAt" TIMESTAMP(3),
ADD COLUMN "discardedById" INTEGER;

-- AddForeignKey
ALTER TABLE "ProjectRecordEmail" ADD CONSTRAINT "ProjectRecordEmail_discardedById_fkey" FOREIGN KEY ("discardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
