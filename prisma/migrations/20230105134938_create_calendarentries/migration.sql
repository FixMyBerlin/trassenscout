-- CreateTable
-- blitz g all calendarEntries title:string startAt:dateTime "locationName:string?" "locationUrl:string?" "description:string?" --dry-run
CREATE TABLE "CalendarEntry" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "locationName" TEXT,
    "locationUrl" TEXT,
    "description" TEXT,

    CONSTRAINT "CalendarEntry_pkey" PRIMARY KEY ("id")
);
