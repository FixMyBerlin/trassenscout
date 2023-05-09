-- Empty table, so migration works
TRUNCATE TABLE "Stakeholdernote";

-- DropForeignKey
ALTER TABLE "Stakeholdernote" DROP CONSTRAINT "Stakeholdernote_sectionId_fkey";

-- AlterTable
ALTER TABLE "Stakeholdernote" DROP COLUMN "sectionId",
ADD COLUMN     "subsectionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Stakeholdernote" ADD CONSTRAINT "Stakeholdernote_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
