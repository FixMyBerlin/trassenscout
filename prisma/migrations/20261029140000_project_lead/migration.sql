-- AlterTable
ALTER TABLE "Project" ADD COLUMN "projectLeadId" INTEGER;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
