/*
  Warnings:

  - A unique constraint covering the columns `[title,projectId]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Topic_title_projectId_key" ON "Topic"("title", "projectId");
