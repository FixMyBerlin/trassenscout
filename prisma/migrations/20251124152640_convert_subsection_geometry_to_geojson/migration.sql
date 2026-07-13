-- Convert existing subsection geometry from array format to GeoJSON LineString format
-- This matches the format used by Subsubsection after migration 20251105100239
UPDATE "Subsection"
SET geometry = jsonb_build_object('type', 'LineString', 'coordinates', geometry::jsonb)
WHERE geometry IS NOT NULL
  AND jsonb_typeof(geometry::jsonb) = 'array'
  AND jsonb_array_length(geometry::jsonb) > 0
  AND jsonb_typeof(geometry::jsonb -> 0) = 'array'
  AND NOT (geometry::jsonb ? 'type'); -- Only convert if not already GeoJSON format
