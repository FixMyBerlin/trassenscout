-- AlterTable
ALTER TABLE "Project" ADD COLUMN "subsubsectionExtraFieldDefinitions" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Subsubsection" ADD COLUMN "extraFields" JSONB NOT NULL DEFAULT '{}';
