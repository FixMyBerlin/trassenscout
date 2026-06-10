-- CreateEnum
CREATE TYPE "MembershipRoleEnum" AS ENUM ('VIEWER', 'EDITOR');

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN   "role" "MembershipRoleEnum" NOT NULL DEFAULT 'EDITOR';
ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT 'VIEWER';
