-- AlterTable (temporary defaults backfill existing rows; @updatedAt is client-side, so drop them after)
ALTER TABLE "Tag"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SurveyResponseTopic"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "SurveyResponseTopic" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Tag_projectId_idx" ON "Tag"("projectId");
