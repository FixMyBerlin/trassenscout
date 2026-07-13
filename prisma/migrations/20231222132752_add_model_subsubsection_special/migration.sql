-- CreateTable
CREATE TABLE "SubsubsectionSpecial" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubsubsectionSpecial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SubsubsectionToSubsubsectionSpecial" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SubsubsectionSpecial_projectId_slug_key" ON "SubsubsectionSpecial"("projectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "_SubsubsectionToSubsubsectionSpecial_AB_unique" ON "_SubsubsectionToSubsubsectionSpecial"("A", "B");

-- CreateIndex
CREATE INDEX "_SubsubsectionToSubsubsectionSpecial_B_index" ON "_SubsubsectionToSubsubsectionSpecial"("B");

-- AddForeignKey
ALTER TABLE "SubsubsectionSpecial" ADD CONSTRAINT "SubsubsectionSpecial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubsubsectionToSubsubsectionSpecial" ADD CONSTRAINT "_SubsubsectionToSubsubsectionSpecial_A_fkey" FOREIGN KEY ("A") REFERENCES "Subsubsection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubsubsectionToSubsubsectionSpecial" ADD CONSTRAINT "_SubsubsectionToSubsubsectionSpecial_B_fkey" FOREIGN KEY ("B") REFERENCES "SubsubsectionSpecial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
