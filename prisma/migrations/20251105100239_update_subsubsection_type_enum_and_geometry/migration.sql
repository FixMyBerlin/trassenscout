-- Step 1: Update existing data to convert geometry from coordinates to GeoJSON format
-- Convert ROUTE (Position[]) to LineString GeoJSON
UPDATE "Subsubsection"
SET geometry = jsonb_build_object('type', 'LineString', 'coordinates', geometry::jsonb)
WHERE type = 'ROUTE' AND geometry IS NOT NULL AND jsonb_typeof(geometry::jsonb) = 'array' AND jsonb_array_length(geometry::jsonb) > 0 AND jsonb_typeof(geometry::jsonb -> 0) = 'array';

-- Convert AREA (Position) to Point GeoJSON
UPDATE "Subsubsection"
SET geometry = jsonb_build_object('type', 'Point', 'coordinates', geometry::jsonb)
WHERE type = 'AREA' AND geometry IS NOT NULL AND jsonb_typeof(geometry::jsonb) = 'array' AND jsonb_array_length(geometry::jsonb) = 2 AND jsonb_typeof(geometry::jsonb -> 0) != 'array';

-- Step 2: AlterEnum
BEGIN;
-- First, convert the column to text temporarily so we can update the values
ALTER TABLE "Subsubsection" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Subsubsection" ALTER COLUMN "type" TYPE text USING (type::text);

-- Update existing data: ROUTE -> LINE, AREA -> POINT
UPDATE "Subsubsection" SET type = 'LINE' WHERE type = 'ROUTE';
UPDATE "Subsubsection" SET type = 'POINT' WHERE type = 'AREA';

-- Create the new enum type
CREATE TYPE "SubsubsectionTypeEnum_new" AS ENUM ('POINT', 'LINE', 'POLYGON');

-- Convert the column to use the new enum type
ALTER TABLE "Subsubsection" ALTER COLUMN "type" TYPE "SubsubsectionTypeEnum_new" USING (type::"SubsubsectionTypeEnum_new");

-- Clean up the old enum and rename the new one
ALTER TYPE "SubsubsectionTypeEnum" RENAME TO "SubsubsectionTypeEnum_old";
ALTER TYPE "SubsubsectionTypeEnum_new" RENAME TO "SubsubsectionTypeEnum";
DROP TYPE "SubsubsectionTypeEnum_old";

-- Set the default
ALTER TABLE "Subsubsection" ALTER COLUMN "type" SET DEFAULT 'LINE';
COMMIT;
