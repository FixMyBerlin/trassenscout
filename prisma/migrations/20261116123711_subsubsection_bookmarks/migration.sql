-- AlterTable
ALTER TABLE "AcquisitionArea" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "bookmarksEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- CreateTable
CREATE TABLE "SubsubsectionBookmark" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "subsubsectionId" INTEGER NOT NULL,

    CONSTRAINT "SubsubsectionBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubsubsectionBookmark_subsubsectionId_idx" ON "SubsubsectionBookmark"("subsubsectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubsubsectionBookmark_userId_subsubsectionId_key" ON "SubsubsectionBookmark"("userId", "subsubsectionId");

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsubsectionBookmark" ADD CONSTRAINT "SubsubsectionBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsubsectionBookmark" ADD CONSTRAINT "SubsubsectionBookmark_subsubsectionId_fkey" FOREIGN KEY ("subsubsectionId") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionArea" ADD CONSTRAINT "AcquisitionArea_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionArea" ADD CONSTRAINT "AcquisitionArea_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill createdBy and updatedBy of the Maßnahme from the log, as far as it reaches back.
WITH created_log AS (
  SELECT DISTINCT ON (log."subsubsectionId")
    log."subsubsectionId",
    log."userId"
  FROM "LogEntry" log
  WHERE log."subsubsectionId" IS NOT NULL
    AND log."userId" IS NOT NULL
    AND log.action = 'CREATE'
  ORDER BY log."subsubsectionId", log."createdAt" ASC
)
UPDATE "Subsubsection" subsubsection
SET "createdById" = created_log."userId"
FROM created_log
WHERE subsubsection.id = created_log."subsubsectionId";

WITH latest_log AS (
  SELECT DISTINCT ON (log."subsubsectionId")
    log."subsubsectionId",
    log."userId"
  FROM "LogEntry" log
  WHERE log."subsubsectionId" IS NOT NULL
    AND log."userId" IS NOT NULL
    AND log.action IN ('CREATE', 'UPDATE')
  ORDER BY log."subsubsectionId", log."createdAt" DESC
)
UPDATE "Subsubsection" subsubsection
SET "updatedById" = latest_log."userId"
FROM latest_log
WHERE subsubsection.id = latest_log."subsubsectionId";

-- Backfill bookmarks from existing data.
-- Projektleiter:in of the Maßnahme
INSERT INTO "SubsubsectionBookmark" ("userId", "subsubsectionId")
SELECT "managerId", id
FROM "Subsubsection"
WHERE "managerId" IS NOT NULL
ON CONFLICT ("userId", "subsubsectionId") DO NOTHING;

-- Protokolle: assignee, assigner, author and last editor, for every linked Maßnahme (direct relation and m2n)
WITH record_subsubsection AS (
  SELECT id AS "projectRecordId", "subsubsectionId"
  FROM "ProjectRecord"
  WHERE "subsubsectionId" IS NOT NULL
  UNION
  SELECT "A", "B"
  FROM "_ProjectRecordSubsubsections"
),
record_user AS (
  SELECT record.id AS "projectRecordId", record."assignedToId" AS "userId"
  FROM "ProjectRecord" record
  WHERE record."assignedToId" IS NOT NULL
  UNION
  SELECT record.id, record."assignedById"
  FROM "ProjectRecord" record
  WHERE record."assignedById" IS NOT NULL AND record."assignedToId" IS NOT NULL
  UNION
  SELECT record.id, record."userId"
  FROM "ProjectRecord" record
  WHERE record."userId" IS NOT NULL AND record."projectRecordAuthorType" = 'USER'
  UNION
  SELECT record.id, record."updatedById"
  FROM "ProjectRecord" record
  WHERE record."updatedById" IS NOT NULL AND record."projectRecordUpdatedByType" = 'USER'
)
INSERT INTO "SubsubsectionBookmark" ("userId", "subsubsectionId")
SELECT DISTINCT record_user."userId", record_subsubsection."subsubsectionId"
FROM record_user
JOIN record_subsubsection ON record_subsubsection."projectRecordId" = record_user."projectRecordId"
ON CONFLICT ("userId", "subsubsectionId") DO NOTHING;

-- Dokumente uploaded to the Maßnahme ("_SubsubsectionToUpload": A = Subsubsection, B = Upload)
INSERT INTO "SubsubsectionBookmark" ("userId", "subsubsectionId")
SELECT DISTINCT upload."createdById", relation."A"
FROM "Upload" upload
JOIN "_SubsubsectionToUpload" relation ON relation."B" = upload.id
WHERE upload."createdById" IS NOT NULL
ON CONFLICT ("userId", "subsubsectionId") DO NOTHING;

-- Maßnahme created or edited, read from the log. Admins are left out: MCP writes are logged under the
-- admin who owns the token, and MCP must not bookmark.
INSERT INTO "SubsubsectionBookmark" ("userId", "subsubsectionId")
SELECT DISTINCT log."userId", log."subsubsectionId"
FROM "LogEntry" log
JOIN "User" log_user ON log_user.id = log."userId"
WHERE log."subsubsectionId" IS NOT NULL
  AND log.action IN ('CREATE', 'UPDATE')
  AND log_user.role <> 'ADMIN'
ON CONFLICT ("userId", "subsubsectionId") DO NOTHING;
