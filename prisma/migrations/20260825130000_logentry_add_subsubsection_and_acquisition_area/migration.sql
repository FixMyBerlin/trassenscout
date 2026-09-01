-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "acquisitionAreaId" INTEGER,
ADD COLUMN     "subsubsectionId" INTEGER;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_acquisitionAreaId_fkey" FOREIGN KEY ("acquisitionAreaId") REFERENCES "AcquisitionArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
