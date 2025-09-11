-- Add the new lengthM column (nullable initially)
ALTER TABLE "Subsubsection" ADD COLUMN "lengthM" DOUBLE PRECISION;

-- Convert existing lengthKm values to meters (multiply by 1000)
UPDATE "Subsubsection" SET "lengthM" = "lengthKm" * 1000;

-- Make lengthM column NOT NULL
ALTER TABLE "Subsubsection" ALTER COLUMN "lengthM" SET NOT NULL;

-- Drop the old lengthKm column
ALTER TABLE "Subsubsection" DROP COLUMN "lengthKm";
