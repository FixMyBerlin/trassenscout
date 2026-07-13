-- blitz g all subsections name:string "description:string?" "managerId:User" "geometry:json" belongsTo:section belongsTo:user --parent sections --dry-run
-- CreateTable
CREATE TABLE "Subsection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "geometry" JSONB NOT NULL,
    "managerId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "Subsection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsection" ADD CONSTRAINT "Subsection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
