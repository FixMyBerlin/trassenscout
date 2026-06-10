-- First add the current timestamp as default so all data exists
ALTER TABLE "Membership"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Then remove the default from updatedAt
ALTER TABLE "Membership"
ALTER COLUMN "updatedAt" DROP DEFAULT;
