ALTER TABLE "File" RENAME TO "Upload";

-- AlterTable
ALTER TABLE "Upload" RENAME CONSTRAINT "File_pkey" TO "Upload_pkey";

-- RenameForeignKey
ALTER TABLE "Upload" RENAME CONSTRAINT "File_projectId_fkey" TO "Upload_projectId_fkey";

-- RenameForeignKey
ALTER TABLE "Upload" RENAME CONSTRAINT "File_subsectionId_fkey" TO "Upload_subsectionId_fkey";

-- RenameForeignKey
ALTER TABLE "Upload" RENAME CONSTRAINT "File_subsubsectionId_fkey" TO "Upload_subsubsectionId_fkey";
