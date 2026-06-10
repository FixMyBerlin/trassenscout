-- CreateTable
CREATE TABLE "ProjectRecordTemplate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateTitle" TEXT NOT NULL,
    "entryTitle" TEXT NOT NULL,
    "body" TEXT,
    "purpose" TEXT,

    CONSTRAINT "ProjectRecordTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToProjectRecordTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectRecordTemplateToProjectRecordTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToProjectRecordTemplate_AB_unique" ON "_ProjectToProjectRecordTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToProjectRecordTemplate_B_index" ON "_ProjectToProjectRecordTemplate"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectRecordTemplateToProjectRecordTopic_AB_unique" ON "_ProjectRecordTemplateToProjectRecordTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectRecordTemplateToProjectRecordTopic_B_index" ON "_ProjectRecordTemplateToProjectRecordTopic"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToProjectRecordTemplate" ADD CONSTRAINT "_ProjectToProjectRecordTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToProjectRecordTemplate" ADD CONSTRAINT "_ProjectToProjectRecordTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecordTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordTemplateToProjectRecordTopic" ADD CONSTRAINT "_ProjectRecordTemplateToProjectRecordTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectRecordTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectRecordTemplateToProjectRecordTopic" ADD CONSTRAINT "_ProjectRecordTemplateToProjectRecordTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecordTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
