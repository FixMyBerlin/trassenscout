-- CreateEnum
CREATE TYPE "StatusStyleEnum" AS ENUM ('REGULAR', 'DASHED');

-- CreateTable
CREATE TABLE "SubsectionStatus" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "style" "StatusStyleEnum" NOT NULL DEFAULT 'REGULAR',
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubsectionStatus_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "SubsubsectionStatus" ADD COLUMN     "style" "StatusStyleEnum" NOT NULL DEFAULT 'REGULAR';

-- AddColumn
ALTER TABLE "Subsection" ADD COLUMN     "subsectionStatusId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "SubsectionStatus_projectId_slug_key" ON "SubsectionStatus"("projectId", "slug");

-- AddForeignKey
ALTER TABLE "SubsectionStatus" ADD CONSTRAINT "SubsectionStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_subsectionStatusId_fkey" FOREIGN KEY ("subsectionStatusId") REFERENCES "SubsectionStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing data: Copy SubsubsectionStatus to SubsectionStatus
-- This creates subsection statuses based on existing subsubsection statuses
INSERT INTO "SubsectionStatus" ("createdAt", "updatedAt", "slug", "title", "style", "projectId")
SELECT
    "createdAt",
    "updatedAt",
    "slug",
    "title",
    "style",
    "projectId"
FROM "SubsubsectionStatus";

-- Update Subsection to reference the new SubsectionStatus
-- Map the old subsubsectionStatusId to the new subsectionStatusId based on matching project and slug
UPDATE "Subsection"
SET "subsectionStatusId" = (
    SELECT ss_new.id
    FROM "SubsectionStatus" ss_new
    INNER JOIN "SubsubsectionStatus" ss_old ON ss_old."projectId" = ss_new."projectId" AND ss_old."slug" = ss_new."slug"
    WHERE ss_old.id = "Subsection"."subsubsectionStatusId"
)
WHERE "subsubsectionStatusId" IS NOT NULL;

-- Remove the old foreign key constraint and column from Subsection
ALTER TABLE "Subsection" DROP CONSTRAINT IF EXISTS "Subsection_subsubsectionStatusId_fkey";
ALTER TABLE "Subsection" DROP COLUMN "subsubsectionStatusId";
