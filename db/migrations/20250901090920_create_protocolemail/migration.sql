-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "protocolEmailId" INTEGER;

-- CreateTable
CREATE TABLE "ProtocolEmail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ProtocolEmail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_protocolEmailId_fkey" FOREIGN KEY ("protocolEmailId") REFERENCES "ProtocolEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
