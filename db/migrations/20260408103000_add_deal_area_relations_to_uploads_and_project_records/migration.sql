-- Add deal area scoping to uploads and project records
ALTER TABLE "Upload"
ADD COLUMN "dealAreaId" INTEGER;

ALTER TABLE "ProjectRecord"
ADD COLUMN "dealAreaId" INTEGER;

ALTER TABLE "Upload"
ADD CONSTRAINT "Upload_dealAreaId_fkey"
FOREIGN KEY ("dealAreaId") REFERENCES "DealArea"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "ProjectRecord"
ADD CONSTRAINT "ProjectRecord_dealAreaId_fkey"
FOREIGN KEY ("dealAreaId") REFERENCES "DealArea"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
