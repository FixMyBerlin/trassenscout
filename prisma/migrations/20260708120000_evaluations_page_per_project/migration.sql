-- Per-project EvaluationsPage: migrate global singleton into project-scoped rows.

-- Step 1: Add nullable projectId and createdAt
ALTER TABLE "EvaluationsPage" ADD COLUMN "projectId" INTEGER;
ALTER TABLE "EvaluationsPage" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Switch id from fixed default to autoincrement (before per-project inserts)
ALTER TABLE "EvaluationsPage" ALTER COLUMN "id" DROP DEFAULT;
CREATE SEQUENCE "EvaluationsPage_id_seq";
SELECT setval(
  '"EvaluationsPage_id_seq"',
  COALESCE((SELECT MAX("id") FROM "EvaluationsPage"), 1),
  true
);
ALTER TABLE "EvaluationsPage" ALTER COLUMN "id" SET DEFAULT nextval('"EvaluationsPage_id_seq"');
ALTER SEQUENCE "EvaluationsPage_id_seq" OWNED BY "EvaluationsPage"."id";

-- Step 3: Copy global content into projects with evaluationsEnabled = true
INSERT INTO "EvaluationsPage" ("title", "markdown", "updatedAt", "updatedById", "projectId", "createdAt")
SELECT ep."title", ep."markdown", ep."updatedAt", ep."updatedById", p."id", NOW()
FROM "Project" p
CROSS JOIN "EvaluationsPage" ep
WHERE ep."id" = 1
  AND ep."projectId" IS NULL
  AND p."evaluationsEnabled" = true;

-- Step 4: Delete orphaned global singleton row
DELETE FROM "EvaluationsPage" WHERE "id" = 1 AND "projectId" IS NULL;

-- Step 5: Enforce projectId NOT NULL, unique constraint, and FK
ALTER TABLE "EvaluationsPage" ALTER COLUMN "projectId" SET NOT NULL;
CREATE UNIQUE INDEX "EvaluationsPage_projectId_key" ON "EvaluationsPage"("projectId");
ALTER TABLE "EvaluationsPage"
ADD CONSTRAINT "EvaluationsPage_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
