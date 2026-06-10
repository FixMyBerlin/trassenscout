ALTER TABLE "Parcel"
ADD COLUMN "gmlId" TEXT;

CREATE UNIQUE INDEX "Parcel_gmlId_key" ON "Parcel"("gmlId");

ALTER TABLE "Parcel"
DROP COLUMN "officialId";
