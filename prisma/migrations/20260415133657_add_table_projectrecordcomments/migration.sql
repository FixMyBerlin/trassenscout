-- CreateTable
CREATE TABLE "ProjectRecordComment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectRecordId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "ProjectRecordComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectRecordComment" ADD CONSTRAINT "ProjectRecordComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRecordComment" ADD CONSTRAINT "ProjectRecordComment_projectRecordId_fkey" FOREIGN KEY ("projectRecordId") REFERENCES "ProjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
