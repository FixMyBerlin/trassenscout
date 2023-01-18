/*
  Warnings:

  - Added the required column `status` to the `Stakeholdernote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StakeholdernoteStatusEnum" AS ENUM ('irrelevant', 'pending', 'inprogress', 'done');

-- AlterTable
ALTER TABLE "Stakeholdernote" ADD COLUMN     "status" "StakeholdernoteStatusEnum" NOT NULL,
ADD COLUMN     "statusText" TEXT;
