-- CreateTable (Tag-first: A = Tag, B = Upload)
CREATE TABLE "_TagToUpload" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TagToUpload_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE INDEX "_TagToUpload_B_index" ON "_TagToUpload"("B");

-- AddForeignKey
ALTER TABLE "_TagToUpload"
ADD CONSTRAINT "_TagToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUpload"
ADD CONSTRAINT "_TagToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
