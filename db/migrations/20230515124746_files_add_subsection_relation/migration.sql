-- AlterTable
ALTER TABLE "File" ADD COLUMN     "subsectionId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
