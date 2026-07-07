-- CreateTable (Prisma implicit M2M column order: A = Contact, B = Tag)
CREATE TABLE "_TagToContact" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TagToContact_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE INDEX "_TagToContact_B_index" ON "_TagToContact"("B");

-- AddForeignKey
ALTER TABLE "_TagToContact"
ADD CONSTRAINT "_TagToContact_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToContact"
ADD CONSTRAINT "_TagToContact_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
