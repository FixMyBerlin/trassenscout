-- create new implicit relation table for multi-value infrastructure types on subsubsections
CREATE TABLE "_SubsubsectionInfrastructureTypes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- backfill existing singular infrastructure type assignments into the new relation table
INSERT INTO "_SubsubsectionInfrastructureTypes" ("A", "B")
SELECT "id", "subsubsectionInfrastructureTypeId"
FROM "Subsubsection"
WHERE "subsubsectionInfrastructureTypeId" IS NOT NULL;

-- create unique index for the relation table (required by Prisma)
CREATE UNIQUE INDEX "_SubsubsectionInfrastructureTypes_AB_unique"
ON "_SubsubsectionInfrastructureTypes"("A", "B");

-- create index for the relation table (required by Prisma)
CREATE INDEX "_SubsubsectionInfrastructureTypes_B_index"
ON "_SubsubsectionInfrastructureTypes"("B");

-- add foreign keys
ALTER TABLE "_SubsubsectionInfrastructureTypes"
ADD CONSTRAINT "_SubsubsectionInfrastructureTypes_A_fkey"
FOREIGN KEY ("A") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_SubsubsectionInfrastructureTypes"
ADD CONSTRAINT "_SubsubsectionInfrastructureTypes_B_fkey"
FOREIGN KEY ("B") REFERENCES "SubsubsectionInfrastructureType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
