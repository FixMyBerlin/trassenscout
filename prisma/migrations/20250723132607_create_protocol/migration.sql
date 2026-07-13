-- CreateTable
CREATE TABLE "Protocol" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtocolTopic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProtocolTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProtocolToProtocolTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolTopic_title_projectId_key" ON "ProtocolTopic"("title", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProtocolToProtocolTopic_AB_unique" ON "_ProtocolToProtocolTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_ProtocolToProtocolTopic_B_index" ON "_ProtocolToProtocolTopic"("B");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtocolTopic" ADD CONSTRAINT "ProtocolTopic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProtocolToProtocolTopic" ADD CONSTRAINT "_ProtocolToProtocolTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProtocolToProtocolTopic" ADD CONSTRAINT "_ProtocolToProtocolTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "ProtocolTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
