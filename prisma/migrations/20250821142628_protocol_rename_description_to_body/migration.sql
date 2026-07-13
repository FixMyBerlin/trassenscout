-- AlterTable: Add new column "body"
ALTER TABLE "Protocol" ADD COLUMN "body" TEXT;

-- Update: Backfill the new column with data from the old column
UPDATE "Protocol" SET "body" = "description";

-- AlterTable: Drop the old column "description"
ALTER TABLE "Protocol" DROP COLUMN "description";
