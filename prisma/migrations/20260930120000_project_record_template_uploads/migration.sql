-- Temporary: documents offered with a Protokollvorlage while forms are hidden. Drop the table to revert.
-- CreateTable
CREATE TABLE "_ProjectRecordTemplateToUpload" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectRecordTemplateToUpload_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectRecordTemplateToUpload_B_index" ON "_ProjectRecordTemplateToUpload"("B");

-- AddForeignKey
ALTER TABLE "_ProjectRecordTemplateToUpload" ADD CONSTRAINT "_ProjectRecordTemplateToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecordTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordTemplateToUpload" ADD CONSTRAINT "_ProjectRecordTemplateToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

