-- On Project…
--    Step 1: Add a new nullable column
ALTER TABLE "Project" ADD COLUMN "subTitle" TEXT;
--    Step 2: Update the new column with existing data
UPDATE "Project" SET "subTitle" = "title";
--    Step 3: Drop the original column
ALTER TABLE "Project" DROP COLUMN "title";
--    AlterTable
ALTER TABLE "Project" DROP COLUMN "shortTitle";

-- On Section…
--    AlterTable
ALTER TABLE "Section" DROP COLUMN "title";

-- On Subsection…
--    AlterTable
ALTER TABLE "Subsection" DROP COLUMN "title";

-- On Subsubsection…
--    Step 1: Add a new nullable column
ALTER TABLE "Subsubsection" ADD COLUMN "subTitle" TEXT;
--    Step 2: Update the new column with existing data
UPDATE "Subsubsection" SET "subTitle" = "title";
--    Step 3: Drop the original column
ALTER TABLE "Subsubsection" DROP COLUMN "title";

-- DOKU:
-- Part of the multi steps above was done, the migrations I tried before deleted all data in order to change the NOT NULL condition. However, the following migration is likely the more elegant way to do this…
-- ALTER TABLE "Project" ALTER COLUMN "title" DROP NOT NULL;
