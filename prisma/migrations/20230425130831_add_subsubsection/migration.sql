-- CreateTable
CREATE TABLE "Subsubsection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "geometry" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Subsubsection_pkey" PRIMARY KEY ("id")
);
