-- AlterTable
ALTER TABLE "ProjectRecord" ADD COLUMN     "subsubsectionId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
