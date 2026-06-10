/*
  Warnings:

  - You are about to drop the column `superadmin` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "superadmin",
DROP COLUMN "role",
ADD COLUMN     "role" "UserRoleEnum" NOT NULL DEFAULT 'USER';
