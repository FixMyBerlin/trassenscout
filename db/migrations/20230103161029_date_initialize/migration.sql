-- CreateTable
-- `blitz generate all date startAt:dateTime endAt:dateTime "title:string?" "locationName:string?" "locationUrl:string?" "description:string?" --dry-run`
CREATE TABLE "Date" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "title" TEXT,
    "locationName" TEXT,
    "locationUrl" TEXT,
    "description" TEXT
);
