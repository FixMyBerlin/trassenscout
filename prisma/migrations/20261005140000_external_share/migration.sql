-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "externalShareEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "externalShareToken" TEXT;

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "externalShareEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Project_externalShareToken_key" ON "Project"("externalShareToken");
