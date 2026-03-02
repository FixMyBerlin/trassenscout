-- CreateTable
CREATE TABLE "SupportDocument" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "SupportDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupportDocument" ADD CONSTRAINT "SupportDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
