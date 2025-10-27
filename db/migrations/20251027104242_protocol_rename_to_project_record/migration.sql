/*
  Warnings:

  - Renaming Protocol-related tables and columns to ProjectRecord
  - This migration preserves all existing data

*/

-- Step 1: Rename Enums (create new, convert values, drop old)
CREATE TYPE "ProjectRecordType" AS ENUM ('SYSTEM', 'USER');
CREATE TYPE "ProjectRecordReviewState" AS ENUM ('NEEDSREVIEW', 'NEEDSADMINREVIEW', 'REJECTED', 'APPROVED');

-- Step 2: Drop foreign key constraints (will be recreated with new names)
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_protocolId_fkey";
ALTER TABLE "Protocol" DROP CONSTRAINT "Protocol_projectId_fkey";
ALTER TABLE "Protocol" DROP CONSTRAINT "Protocol_protocolEmailId_fkey";
ALTER TABLE "Protocol" DROP CONSTRAINT "Protocol_reviewedById_fkey";
ALTER TABLE "Protocol" DROP CONSTRAINT "Protocol_subsectionId_fkey";
ALTER TABLE "Protocol" DROP CONSTRAINT "Protocol_updatedById_fkey";
ALTER TABLE "Protocol" DROP CONSTRAINT "Protocol_userId_fkey";
ALTER TABLE "ProtocolEmail" DROP CONSTRAINT "ProtocolEmail_projectId_fkey";
ALTER TABLE "ProtocolTopic" DROP CONSTRAINT "ProtocolTopic_projectId_fkey";
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_protocolEmailId_fkey";
ALTER TABLE "_ProtocolToProtocolTopic" DROP CONSTRAINT "_ProtocolToProtocolTopic_A_fkey";
ALTER TABLE "_ProtocolToProtocolTopic" DROP CONSTRAINT "_ProtocolToProtocolTopic_B_fkey";
ALTER TABLE "_ProtocolToUpload" DROP CONSTRAINT "_ProtocolToUpload_A_fkey";
ALTER TABLE "_ProtocolToUpload" DROP CONSTRAINT "_ProtocolToUpload_B_fkey";

-- Step 3: Rename tables
ALTER TABLE "ProtocolEmail" RENAME TO "ProjectRecordEmail";
ALTER TABLE "ProtocolTopic" RENAME TO "ProjectRecordTopic";
ALTER TABLE "_ProtocolToProtocolTopic" RENAME TO "_ProjectRecordToProjectRecordTopic";
ALTER TABLE "_ProtocolToUpload" RENAME TO "_ProjectRecordToUpload";

-- Step 4: Convert enum types in Protocol table (before renaming table and columns)
-- First, drop the default values
ALTER TABLE "Protocol" ALTER COLUMN "protocolAuthorType" DROP DEFAULT;
ALTER TABLE "Protocol" ALTER COLUMN "protocolUpdatedByType" DROP DEFAULT;
ALTER TABLE "Protocol" ALTER COLUMN "reviewState" DROP DEFAULT;

-- Then, change the column types
ALTER TABLE "Protocol"
  ALTER COLUMN "protocolAuthorType" TYPE "ProjectRecordType" USING "protocolAuthorType"::text::"ProjectRecordType";
ALTER TABLE "Protocol"
  ALTER COLUMN "protocolUpdatedByType" TYPE "ProjectRecordType" USING "protocolUpdatedByType"::text::"ProjectRecordType";
ALTER TABLE "Protocol"
  ALTER COLUMN "reviewState" TYPE "ProjectRecordReviewState" USING "reviewState"::text::"ProjectRecordReviewState";

-- Finally, re-add the default values with the new enum types
ALTER TABLE "Protocol" ALTER COLUMN "protocolAuthorType" SET DEFAULT 'SYSTEM'::"ProjectRecordType";
ALTER TABLE "Protocol" ALTER COLUMN "protocolUpdatedByType" SET DEFAULT 'SYSTEM'::"ProjectRecordType";
ALTER TABLE "Protocol" ALTER COLUMN "reviewState" SET DEFAULT 'APPROVED'::"ProjectRecordReviewState";

-- Step 5: Rename Protocol table to ProjectRecord
ALTER TABLE "Protocol" RENAME TO "ProjectRecord";

-- Step 6: Rename primary key constraints for renamed tables
ALTER TABLE "ProjectRecord" RENAME CONSTRAINT "Protocol_pkey" TO "ProjectRecord_pkey";
ALTER TABLE "ProjectRecordEmail" RENAME CONSTRAINT "ProtocolEmail_pkey" TO "ProjectRecordEmail_pkey";
ALTER TABLE "ProjectRecordTopic" RENAME CONSTRAINT "ProtocolTopic_pkey" TO "ProjectRecordTopic_pkey";

-- Step 7: Rename columns in ProjectRecord table
ALTER TABLE "ProjectRecord" RENAME COLUMN "protocolAuthorType" TO "projectRecordAuthorType";
ALTER TABLE "ProjectRecord" RENAME COLUMN "protocolUpdatedByType" TO "projectRecordUpdatedByType";
ALTER TABLE "ProjectRecord" RENAME COLUMN "protocolEmailId" TO "projectRecordEmailId";

-- Step 8: Rename columns in LogEntry table
ALTER TABLE "LogEntry" RENAME COLUMN "protocolId" TO "projectRecordId";

-- Step 9: Rename columns in Upload table
ALTER TABLE "Upload" RENAME COLUMN "protocolEmailId" TO "projectRecordEmailId";

-- Step 10: Drop old enum types
DROP TYPE "ProtocolType";
DROP TYPE "ProtocolReviewState";

-- Step 11: Recreate indexes on renamed join tables
DROP INDEX IF EXISTS "_ProtocolToProtocolTopic_AB_unique";
DROP INDEX IF EXISTS "_ProtocolToProtocolTopic_B_index";
DROP INDEX IF EXISTS "_ProtocolToUpload_AB_unique";
DROP INDEX IF EXISTS "_ProtocolToUpload_B_index";

CREATE UNIQUE INDEX "_ProjectRecordToProjectRecordTopic_AB_unique" ON "_ProjectRecordToProjectRecordTopic"("A", "B");
CREATE INDEX "_ProjectRecordToProjectRecordTopic_B_index" ON "_ProjectRecordToProjectRecordTopic"("B");
CREATE UNIQUE INDEX "_ProjectRecordToUpload_AB_unique" ON "_ProjectRecordToUpload"("A", "B");
CREATE INDEX "_ProjectRecordToUpload_B_index" ON "_ProjectRecordToUpload"("B");

-- Step 12: Recreate unique constraint on ProjectRecordTopic
DROP INDEX IF EXISTS "ProtocolTopic_title_projectId_key";
CREATE UNIQUE INDEX "ProjectRecordTopic_title_projectId_key" ON "ProjectRecordTopic"("title", "projectId");

-- Step 13: Recreate foreign key constraints with new names
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_projectRecordEmailId_fkey" FOREIGN KEY ("projectRecordEmailId") REFERENCES "ProjectRecordEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_projectRecordId_fkey" FOREIGN KEY ("projectRecordId") REFERENCES "ProjectRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectRecordEmail" ADD CONSTRAINT "ProjectRecordEmail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_projectRecordEmailId_fkey" FOREIGN KEY ("projectRecordEmailId") REFERENCES "ProjectRecordEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProjectRecordTopic" ADD CONSTRAINT "ProjectRecordTopic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProjectRecordToProjectRecordTopic" ADD CONSTRAINT "_ProjectRecordToProjectRecordTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProjectRecordToProjectRecordTopic" ADD CONSTRAINT "_ProjectRecordToProjectRecordTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecordTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProjectRecordToUpload" ADD CONSTRAINT "_ProjectRecordToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProjectRecordToUpload" ADD CONSTRAINT "_ProjectRecordToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
