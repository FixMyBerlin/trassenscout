-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "passwordHashMigratedAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_AcquisitionAreaToUpload" ADD CONSTRAINT "_AcquisitionAreaToUpload_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AcquisitionAreaToUpload_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectRecordAcquisitionAreas" ADD CONSTRAINT "_ProjectRecordAcquisitionAreas_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectRecordAcquisitionAreas_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectRecordSubsubsections" ADD CONSTRAINT "_ProjectRecordSubsubsections_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectRecordSubsubsections_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectRecordTemplateToProjectRecordTopic" ADD CONSTRAINT "_ProjectRecordTemplateToProjectRecordTopic_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectRecordTemplateToProjectRecordTopic_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectRecordToProjectRecordTopic" ADD CONSTRAINT "_ProjectRecordToProjectRecordTopic_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectRecordToProjectRecordTopic_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectRecordToUpload" ADD CONSTRAINT "_ProjectRecordToUpload_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectRecordToUpload_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectToProjectRecordTemplate" ADD CONSTRAINT "_ProjectToProjectRecordTemplate_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProjectToProjectRecordTemplate_AB_unique";

-- AlterTable
ALTER TABLE "_SubsubsectionInfrastructureTypes" ADD CONSTRAINT "_SubsubsectionInfrastructureTypes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SubsubsectionInfrastructureTypes_AB_unique";

-- AlterTable
ALTER TABLE "_SubsubsectionToSubsubsectionSpecial" ADD CONSTRAINT "_SubsubsectionToSubsubsectionSpecial_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SubsubsectionToSubsubsectionSpecial_AB_unique";

-- AlterTable
ALTER TABLE "_SubsubsectionToUpload" ADD CONSTRAINT "_SubsubsectionToUpload_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SubsubsectionToUpload_AB_unique";

-- AlterTable
ALTER TABLE "_SurveyResponseToSurveyResponseTopic" ADD CONSTRAINT "_SurveyResponseToSurveyResponseTopic_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SurveyResponseToSurveyResponseTopic_AB_unique";

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "idToken" TEXT,
    "password" TEXT,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_token_key" ON "AuthSession"("token");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_userId_idx" ON "Verification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
