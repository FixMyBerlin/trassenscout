-- AlterEnum
BEGIN;
CREATE TYPE "ProtocolReviewState_new" AS ENUM ('NEEDSREVIEW', 'NEEDSADMINREVIEW', 'REJECTED', 'APPROVED');
ALTER TABLE "Protocol" ALTER COLUMN "reviewState" DROP DEFAULT;
ALTER TABLE "Protocol" ALTER COLUMN "reviewState" TYPE "ProtocolReviewState_new" USING ("reviewState"::text::"ProtocolReviewState_new");
ALTER TYPE "ProtocolReviewState" RENAME TO "ProtocolReviewState_old";
ALTER TYPE "ProtocolReviewState_new" RENAME TO "ProtocolReviewState";
DROP TYPE "ProtocolReviewState_old";
ALTER TABLE "Protocol" ALTER COLUMN "reviewState" SET DEFAULT 'APPROVED';
COMMIT;
