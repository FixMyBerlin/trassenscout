/*
  Rename ProjectRecordTopic → Tag in place (preserves all IDs and relations).
  Join tables follow Prisma's implicit M2M convention: columns A/B are ordered
  alphabetically by model name (ProjectRecord < Tag, so A = ProjectRecord, B = Tag).
  Table names come from the named relations: _TagToProjectRecord, _TagToProjectRecordTemplate.
*/

-- Drop foreign key constraints (recreated with new names)
ALTER TABLE "_ProjectRecordToProjectRecordTopic"
DROP CONSTRAINT "_ProjectRecordToProjectRecordTopic_A_fkey";

ALTER TABLE "_ProjectRecordToProjectRecordTopic"
DROP CONSTRAINT "_ProjectRecordToProjectRecordTopic_B_fkey";

ALTER TABLE "_ProjectRecordTemplateToProjectRecordTopic"
DROP CONSTRAINT "_ProjectRecordTemplateToProjectRecordTopic_A_fkey";

ALTER TABLE "_ProjectRecordTemplateToProjectRecordTopic"
DROP CONSTRAINT "_ProjectRecordTemplateToProjectRecordTopic_B_fkey";

ALTER TABLE "ProjectRecordTopic"
DROP CONSTRAINT "ProjectRecordTopic_projectId_fkey";

-- Rename main table
ALTER TABLE "ProjectRecordTopic" RENAME TO "Tag";

ALTER TABLE "Tag" RENAME CONSTRAINT "ProjectRecordTopic_pkey" TO "Tag_pkey";

ALTER INDEX "ProjectRecordTopic_title_projectId_key" RENAME TO "Tag_title_projectId_key";

-- Rename join tables in place (column order unchanged: A = ProjectRecord/Template, B = Tag)
ALTER TABLE "_ProjectRecordToProjectRecordTopic" RENAME TO "_TagToProjectRecord";

ALTER TABLE "_TagToProjectRecord"
RENAME CONSTRAINT "_ProjectRecordToProjectRecordTopic_AB_pkey" TO "_TagToProjectRecord_AB_pkey";

ALTER INDEX "_ProjectRecordToProjectRecordTopic_B_index" RENAME TO "_TagToProjectRecord_B_index";

ALTER TABLE "_ProjectRecordTemplateToProjectRecordTopic"
RENAME TO "_TagToProjectRecordTemplate";

ALTER TABLE "_TagToProjectRecordTemplate"
RENAME CONSTRAINT "_ProjectRecordTemplateToProjectRecordTopic_AB_pkey" TO "_TagToProjectRecordTemplate_AB_pkey";

ALTER INDEX "_ProjectRecordTemplateToProjectRecordTopic_B_index"
RENAME TO "_TagToProjectRecordTemplate_B_index";

-- Recreate foreign key constraints
ALTER TABLE "Tag"
ADD CONSTRAINT "Tag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_TagToProjectRecord"
ADD CONSTRAINT "_TagToProjectRecord_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_TagToProjectRecord"
ADD CONSTRAINT "_TagToProjectRecord_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_TagToProjectRecordTemplate"
ADD CONSTRAINT "_TagToProjectRecordTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecordTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_TagToProjectRecordTemplate"
ADD CONSTRAINT "_TagToProjectRecordTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
