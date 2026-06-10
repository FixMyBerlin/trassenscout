-- CreateTable
CREATE TABLE "Stakeholdernote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusText" TEXT,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "Stakeholdernote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stakeholdernote" ADD CONSTRAINT "Stakeholdernote_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
