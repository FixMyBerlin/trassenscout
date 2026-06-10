-- CreateTable: m2m ProjectRecord <-> Subsubsection
-- (A = ProjectRecord, B = Subsubsection — alphabetical Prisma convention: P < S)
CREATE TABLE "_ProjectRecordSubsubsections" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable: m2m ProjectRecord <-> AcquisitionArea
-- (A = AcquisitionArea, B = ProjectRecord — alphabetical Prisma convention: A < P)
CREATE TABLE "_ProjectRecordAcquisitionAreas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectRecordSubsubsections_AB_unique" ON "_ProjectRecordSubsubsections"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectRecordSubsubsections_B_index" ON "_ProjectRecordSubsubsections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectRecordAcquisitionAreas_AB_unique" ON "_ProjectRecordAcquisitionAreas"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectRecordAcquisitionAreas_B_index" ON "_ProjectRecordAcquisitionAreas"("B");

-- AddForeignKey
ALTER TABLE "_ProjectRecordSubsubsections" ADD CONSTRAINT "_ProjectRecordSubsubsections_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordSubsubsections" ADD CONSTRAINT "_ProjectRecordSubsubsections_B_fkey" FOREIGN KEY ("B") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordAcquisitionAreas" ADD CONSTRAINT "_ProjectRecordAcquisitionAreas_A_fkey" FOREIGN KEY ("A") REFERENCES "AcquisitionArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordAcquisitionAreas" ADD CONSTRAINT "_ProjectRecordAcquisitionAreas_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
