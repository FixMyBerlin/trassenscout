
ALTER TABLE "ProjectRecord"
ADD COLUMN "assignedById" INTEGER,
ADD COLUMN "assignedAt" TIMESTAMP(3);

ALTER TABLE "ProjectRecord"
ADD CONSTRAINT "ProjectRecord_assignedById_fkey"
FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ProjectRecord_assignedToId_idx" ON "ProjectRecord" ("assignedToId");
CREATE INDEX "ProjectRecord_assignedById_idx" ON "ProjectRecord" ("assignedById");

WITH assignment_log AS (
  SELECT DISTINCT ON (log."projectRecordId")
    log."projectRecordId",
    log."userId",
    log."createdAt"
  FROM "LogEntry" log
  WHERE log."projectRecordId" IS NOT NULL
    AND log."userId" IS NOT NULL
    AND (
      (log.action = 'CREATE' AND log.changes ? 'assignedToId' AND log.changes ->> 'assignedToId' IS NOT NULL)
      OR (
        log.action = 'UPDATE'
        AND jsonb_typeof(log.changes) = 'array'
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(log.changes) AS entry
          WHERE entry -> 'path' ->> 0 = 'assignedToId'
        )
      )
    )
  ORDER BY log."projectRecordId", log."createdAt" DESC
)
UPDATE "ProjectRecord" record
SET "assignedById" = assignment_log."userId",
    "assignedAt" = assignment_log."createdAt"
FROM assignment_log
WHERE record.id = assignment_log."projectRecordId"
  AND record."assignedToId" IS NOT NULL;
