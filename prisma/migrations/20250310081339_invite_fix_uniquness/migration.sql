/*
  Warnings:

  - A unique constraint covering the columns `[email,projectId]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Invite_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Invite_email_projectId_key" ON "Invite"("email", "projectId");
