-- Empty table, so migration works
-- There is no data on production, yet
TRUNCATE TABLE "Subsubsection";

-- CreateEnum
CREATE TYPE "SubsubsectionTypeEnum" AS ENUM ('ROUTE', 'AREA');

-- AlterTable
ALTER TABLE "Subsubsection" DROP COLUMN "guidance",
ADD COLUMN     "managerId" INTEGER NOT NULL,
ADD COLUMN     "type" "SubsubsectionTypeEnum" NOT NULL DEFAULT 'ROUTE',
ADD COLUMN     "costEstimate" DOUBLE PRECISION,
ALTER COLUMN "length" DROP NOT NULL,
ALTER COLUMN "width" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subsubsection_subsectionId_slug_key" ON "Subsubsection"("subsectionId", "slug");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
