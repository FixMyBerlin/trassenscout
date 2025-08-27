-- CreateEnum
CREATE TYPE "ProtocolType" AS ENUM ('SYSTEM', 'USER');

-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "protocolAuthorType" "ProtocolType" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "protocolUpdatedByType" "ProtocolType" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "updatedById" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
