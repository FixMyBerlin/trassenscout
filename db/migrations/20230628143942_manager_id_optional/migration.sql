-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Subsection" DROP CONSTRAINT "Subsection_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Subsubsection" DROP CONSTRAINT "Subsubsection_managerId_fkey";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "managerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subsection" ALTER COLUMN "managerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subsubsection" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
