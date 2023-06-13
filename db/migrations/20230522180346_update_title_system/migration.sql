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
