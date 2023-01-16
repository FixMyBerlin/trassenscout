import db, { CalendarEntry } from "../index"

const seedCalendarEntries = async () => {
  const seedCalendarEntries: Omit<CalendarEntry, "id" | "createdAt" | "updatedAt">[] = [
    {
      title: "Koordinations-Termin Abschnitt 2",
      projectId: 1,
      startAt: new Date("2023-12-14 10:00"),
      locationName: "Konferenz Raum A",
      locationUrl: "https://us02web.zoom.us/j/2194140224?pwd=123",
      description:
        "# Meeting: with the team\n ## Weekly meeting of stakeholders \n I think Ich schreibe hier einen Paragraph. \n First Line discussing *RS 8 - Radschnellverbindung*  Second Line. Lorem **Ipsum** __Lorem__ \n 1. Task \n 2. Task2",
    },
    {
      title: "Koordinations-Termin Abschnitt 5",
      projectId: 1,
      startAt: new Date("2023-10-14 10:30"),
      locationName: "Konferenz Raum A",
      locationUrl: "https://us02web.zoom.us/j/2194140224?pwd=123",
      description:
        "# Meeting with the team\n ## Weekly meeting of stakeholders \n Bitte achten Sie auf unser [Digitales Whiteboard](https://placekitten.com/g/200/300)!  \n\n  I think Ich schreibe hier einen Paragraph. \n First Line discussing *RS 8 - Radschnellverbindung*  Second Line. Lorem **Ipsum** __Lorem__ \n 1. Task \n 2. Task2",
    },
    {
      title: "Abstimmung Kreuzungspunkt 14",
      projectId: 2,
      startAt: new Date("2023-02-14 10:00"),
      locationName: null,
      locationUrl: null,
      description: null,
    },
  ]

  for (let i = 0; i < seedCalendarEntries.length; i++) {
    const data = seedCalendarEntries[i]
    if (data) {
      await db.calendarEntry.create({
        data,
      })
    }
  }
}

export default seedCalendarEntries
