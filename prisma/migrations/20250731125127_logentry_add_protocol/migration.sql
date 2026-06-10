-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "protocolId" INTEGER;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE SET NULL ON UPDATE CASCADE;
