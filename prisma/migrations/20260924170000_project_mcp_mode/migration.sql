-- CreateEnum
CREATE TYPE "McpModeEnum" AS ENUM ('DISABLED', 'DRAFT', 'DIRECT');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "mcpMode" "McpModeEnum" NOT NULL DEFAULT 'DISABLED';
ALTER TABLE "Project" ADD COLUMN "mcpDirectUntil" TIMESTAMP(3);

UPDATE "Project" SET "mcpMode" = 'DRAFT' WHERE "mcpEnabled" = true;

ALTER TABLE "Project" DROP COLUMN "mcpEnabled";
