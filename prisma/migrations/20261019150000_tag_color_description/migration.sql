-- CreateEnum
CREATE TYPE "TagColorEnum" AS ENUM ('LIGHT_BLUE', 'BLUE', 'VIOLET', 'PINK', 'RED', 'ORANGE', 'YELLOW', 'LIME', 'MINT', 'CYAN');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "color" "TagColorEnum" NOT NULL DEFAULT 'LIGHT_BLUE',
ADD COLUMN "description" TEXT;
