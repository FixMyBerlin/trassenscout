/*
  Warnings:

  - The `status` column on the `SurveyResponse` table will be altered from an enum to a text type. Ensure that the existing data in the column is compatible with the new type.

*/
-- Step 1: Remove the default value from the status column
ALTER TABLE "SurveyResponse"
ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: Add a temporary column to store existing status values
ALTER TABLE "SurveyResponse"
ADD COLUMN "status_temp" TEXT;

-- Step 3: Copy the values from the status column to the temporary column
UPDATE "SurveyResponse"
SET "status_temp" = "status"::TEXT;

-- Step 4: Alter the status column type to text
ALTER TABLE "SurveyResponse"
ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

-- Step 5: Copy the values back from the temporary column to the status column
UPDATE "SurveyResponse"
SET "status" = "status_temp";

-- Step 6: Drop the temporary column
ALTER TABLE "SurveyResponse"
DROP COLUMN "status_temp";

-- Step 7: Drop the enum type if it is no longer needed
DROP TYPE "SurveyResponseStatusEnum";
