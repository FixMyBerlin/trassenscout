-- Migration to convert isFinalRoute boolean to status-based system
-- 1. Create "ungeklärt (gestrichelte Linie)" status for all projects that have subsections with isFinalRoute=false

-- Insert the new status for each project that has subsections with isFinalRoute=false
INSERT INTO "SubsectionStatus" ("createdAt", "updatedAt", "slug", "title", "style", "projectId")
SELECT
    NOW() as "createdAt",
    NOW() as "updatedAt",
    'non-final' as "slug",
    'ungeklärt (gestrichelte Linie)' as "title",
    'DASHED' as "style",
    s."projectId"
FROM "Subsection" s
WHERE s."isFinalRoute" = false
GROUP BY s."projectId";

-- 2. Update subsections with isFinalRoute=false to use the new status
UPDATE "Subsection"
SET "subsectionStatusId" = (
    SELECT ss.id
    FROM "SubsectionStatus" ss
    WHERE ss."projectId" = "Subsection"."projectId"
    AND ss."slug" = 'non-final'
)
WHERE "isFinalRoute" = false;

-- 3. Remove the isFinalRoute column
ALTER TABLE "Subsection" DROP COLUMN "isFinalRoute";

