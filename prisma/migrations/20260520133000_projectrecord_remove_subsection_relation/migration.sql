-- Remove legacy ProjectRecord -> Subsection relation (Planungsabschnitt)
ALTER TABLE "ProjectRecord"
DROP CONSTRAINT IF EXISTS "ProjectRecord_subsectionId_fkey";

DROP INDEX IF EXISTS "ProjectRecord_subsectionId_idx";

ALTER TABLE "ProjectRecord"
DROP COLUMN IF EXISTS "subsectionId";

