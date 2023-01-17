-- CreateTable
CREATE TABLE "Stakeholdernote" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Stakeholdernote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakeholdernotesOnSubsections" (
    "subsectionId" INTEGER NOT NULL,
    "stakeholdernoteId" INTEGER NOT NULL,

    CONSTRAINT "StakeholdernotesOnSubsections_pkey" PRIMARY KEY ("subsectionId","stakeholdernoteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "StakeholdernotesOnSubsections_subsectionId_stakeholdernoteI_key" ON "StakeholdernotesOnSubsections"("subsectionId", "stakeholdernoteId");

-- AddForeignKey
ALTER TABLE "StakeholdernotesOnSubsections" ADD CONSTRAINT "StakeholdernotesOnSubsections_subsectionId_fkey" FOREIGN KEY ("subsectionId") REFERENCES "Subsection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholdernotesOnSubsections" ADD CONSTRAINT "StakeholdernotesOnSubsections_stakeholdernoteId_fkey" FOREIGN KEY ("stakeholdernoteId") REFERENCES "Stakeholdernote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
