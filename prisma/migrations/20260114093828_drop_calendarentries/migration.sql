/*
  Warnings:

  - You are about to drop the column `calendarentryId` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the `CalendarEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalendarEntry" DROP CONSTRAINT "CalendarEntry_projectId_fkey";

-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_calendarentryId_fkey";

-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "calendarentryId";

-- DropTable
DROP TABLE "CalendarEntry";
