-- CreateTable
-- blitz g all projects name:string "shortName:string?" "introduction:string?" "ownerId:User?" --dry-run
--   and additional manual work with `blitz prisma format` and then changing the relation manuall to plural.
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "introduction" TEXT,
    "userId" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
