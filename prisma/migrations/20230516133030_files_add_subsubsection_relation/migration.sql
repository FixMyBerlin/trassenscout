-- AlterTable
ALTER TABLE "File" ADD COLUMN     "subsubsectionId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
