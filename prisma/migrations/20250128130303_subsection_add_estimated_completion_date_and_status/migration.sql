-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "estimatedCompletionDate" TIMESTAMP(3),
ADD COLUMN     "subsubsectionStatusId" INTEGER;

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_subsubsectionStatusId_fkey" FOREIGN KEY ("subsubsectionStatusId") REFERENCES "SubsubsectionStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
