-- CreateEnum
CREATE TYPE "ProtocolReviewState" AS ENUM ('NEEDSREVIEW', 'REVIEWED', 'REJECTED', 'APPROVED');

-- AlterTable
ALTER TABLE "Protocol" ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewState" "ProtocolReviewState" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" INTEGER;

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
