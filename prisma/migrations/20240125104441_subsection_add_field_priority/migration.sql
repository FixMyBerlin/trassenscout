-- CreateEnum
CREATE TYPE "PriorityEnum" AS ENUM ('OPEN', 'TOP', 'HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "Subsection" ADD COLUMN     "priority" "PriorityEnum" NOT NULL DEFAULT 'OPEN';
