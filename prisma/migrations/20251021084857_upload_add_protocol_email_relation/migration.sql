-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "protocolEmailId" INTEGER;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_protocolEmailId_fkey" FOREIGN KEY ("protocolEmailId") REFERENCES "ProtocolEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
