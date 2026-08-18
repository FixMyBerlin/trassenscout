-- EvaluationsPage: replace the plain markdown column with a structured JSONB config.

-- Step 1: Rename markdown -> config; the column keeps its TEXT content for step 2
ALTER TABLE "EvaluationsPage" RENAME COLUMN "markdown" TO "config";

-- Step 2: Wrap existing markdown in one text-only section ('' = no chart), so pages keep
-- rendering exactly what their editors wrote instead of gaining an unrequested chart

ALTER TABLE "EvaluationsPage"
ALTER COLUMN "config" TYPE JSONB
USING jsonb_build_object(
  'version',
  1,
  'sections',
  CASE
    WHEN btrim("config") = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(
      jsonb_build_object(
        'id',
        'legacy-' || "id",
        'chart',
        '',
        'markdown',
        "config"
      )
    )
  END
);


-- Step 3: New rows start out empty
ALTER TABLE "EvaluationsPage"
ALTER COLUMN "config" SET DEFAULT '{"version":1,"sections":[]}'::jsonb;
