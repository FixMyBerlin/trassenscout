-- Add the new lengthM column (nullable initially)
ALTER TABLE "Subsection" ADD COLUMN "lengthM" DOUBLE PRECISION;

-- Convert existing lengthKm values to meters (multiply by 1000)
UPDATE "Subsection" SET "lengthM" = "lengthKm" * 1000;

-- Make lengthM column NOT NULL
ALTER TABLE "Subsection" ALTER COLUMN "lengthM" SET NOT NULL;

-- Drop the old lengthKm column
ALTER TABLE "Subsection" DROP COLUMN "lengthKm";
