-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "evaluationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EvaluationsPage" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "EvaluationsPage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EvaluationsPage" ADD CONSTRAINT "EvaluationsPage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
