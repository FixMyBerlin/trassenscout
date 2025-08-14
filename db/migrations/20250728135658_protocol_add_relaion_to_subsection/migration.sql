-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "subsectionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
