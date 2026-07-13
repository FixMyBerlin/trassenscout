-- CreateTable
CREATE TABLE "_ProtocolToUpload" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProtocolToUpload_AB_unique" ON "_ProtocolToUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_ProtocolToUpload_B_index" ON "_ProtocolToUpload"("B");

-- AddForeignKey
ALTER TABLE "_ProtocolToUpload" ADD CONSTRAINT "_ProtocolToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProtocolToUpload" ADD CONSTRAINT "_ProtocolToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
