/*
  Warnings:

  - Changed the type of `status` on the `Stakeholdernote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StakeholdernoteStatusEnum" AS ENUM ('irrelevant', 'pending', 'inprogress', 'done');

-- AlterTable
ALTER TABLE "Stakeholdernote" DROP COLUMN "status",
ADD COLUMN     "status" "StakeholdernoteStatusEnum" NOT NULL;
