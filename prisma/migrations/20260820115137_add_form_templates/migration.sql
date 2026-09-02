-- CreateEnum
CREATE TYPE "FormTemplateTypeEnum" AS ENUM ('SUBSUBSECTION', 'ACQUISITIONAREA');

-- AlterTable
ALTER TABLE "ProjectRecord" ADD COLUMN     "projectRecordTemplateId" INTEGER;

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "type" "FormTemplateTypeEnum" NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FormTemplateToProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FormTemplateToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FormTemplateToProjectRecordTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FormTemplateToProjectRecordTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FormTemplateToProjectRecord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FormTemplateToProjectRecord_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_slug_key" ON "FormTemplate"("slug");

-- CreateIndex
CREATE INDEX "_FormTemplateToProject_B_index" ON "_FormTemplateToProject"("B");

-- CreateIndex
CREATE INDEX "_FormTemplateToProjectRecordTemplate_B_index" ON "_FormTemplateToProjectRecordTemplate"("B");

-- CreateIndex
CREATE INDEX "_FormTemplateToProjectRecord_B_index" ON "_FormTemplateToProjectRecord"("B");

-- AddForeignKey
ALTER TABLE "ProjectRecord" ADD CONSTRAINT "ProjectRecord_projectRecordTemplateId_fkey" FOREIGN KEY ("projectRecordTemplateId") REFERENCES "ProjectRecordTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormTemplateToProject" ADD CONSTRAINT "_FormTemplateToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormTemplateToProject" ADD CONSTRAINT "_FormTemplateToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormTemplateToProjectRecordTemplate" ADD CONSTRAINT "_FormTemplateToProjectRecordTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormTemplateToProjectRecordTemplate" ADD CONSTRAINT "_FormTemplateToProjectRecordTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecordTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormTemplateToProjectRecord" ADD CONSTRAINT "_FormTemplateToProjectRecord_A_fkey" FOREIGN KEY ("A") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormTemplateToProjectRecord" ADD CONSTRAINT "_FormTemplateToProjectRecord_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
