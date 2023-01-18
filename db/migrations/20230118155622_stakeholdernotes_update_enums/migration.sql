/*
  Warnings:

  - The values [irrelevant,pending,inprogress,done] on the enum `StakeholdernoteStatusEnum` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Stakeholdernote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StakeholdernoteStatusEnum_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'IRRELEVANT');
ALTER TABLE "Stakeholdernote" ALTER COLUMN "status" TYPE "StakeholdernoteStatusEnum_new" USING ("status"::text::"StakeholdernoteStatusEnum_new");
ALTER TYPE "StakeholdernoteStatusEnum" RENAME TO "StakeholdernoteStatusEnum_old";
ALTER TYPE "StakeholdernoteStatusEnum_new" RENAME TO "StakeholdernoteStatusEnum";
DROP TYPE "StakeholdernoteStatusEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Stakeholdernote" DROP COLUMN "status",
ADD COLUMN     "status" "StakeholdernoteStatusEnum" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRoleEnum" NOT NULL DEFAULT 'USER';
