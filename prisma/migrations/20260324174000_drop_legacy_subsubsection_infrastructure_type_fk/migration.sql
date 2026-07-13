ALTER TABLE "Subsubsection"
DROP CONSTRAINT IF EXISTS "Subsubsection_subsubsectionInfrastructureTypeId_fkey";

DROP INDEX IF EXISTS "Subsubsection_subsubsectionInfrastructureTypeId_idx";

ALTER TABLE "Subsubsection"
DROP COLUMN IF EXISTS "subsubsectionInfrastructureTypeId";
