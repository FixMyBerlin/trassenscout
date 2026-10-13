-- Maßnahmen without geometry: type and geometry are both null or both set.
ALTER TABLE "Subsubsection" ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "geometry" DROP NOT NULL;

ALTER TABLE "Subsubsection" ADD CONSTRAINT "Subsubsection_geometry_type_check" CHECK (
  ("geometry" IS NULL AND "type" IS NULL)
  OR ("geometry" IS NOT NULL AND jsonb_typeof("geometry") <> 'null' AND "type" IS NOT NULL)
);
