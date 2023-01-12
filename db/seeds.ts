import db from "./index"
import seedProjects from "./seeds/projects"
import seedUsers from "./seeds/users"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  await seedUsers()
  await seedProjects()

  const seedCalendarEntries = [
    {
      title: "Koordinations-Termin Abschnitt 2",
      startAt: new Date("2023-12-14 10:00"),
      locationName: "Konferenz Raum A",
      locationUrl: "https://us02web.zoom.us/j/2194140224?pwd=123",
      description:
        "# Meeting: with the team\n ## Weekly meeting of stakeholders \n I think Ich schreibe hier einen Paragraph. \n First Line discussing *RS 8 - Radschnellverbindung*  Second Line. Lorem **Ipsum** __Lorem__ \n 1. Task \n 2. Task2",
    },
    {
      title: "Koordinations-Termin Abschnitt 5",
      startAt: new Date("2023-10-14 10:30"),
      locationName: "Konferenz Raum A",
      locationUrl: "https://us02web.zoom.us/j/2194140224?pwd=123",
      description:
        "# Meeting with the team\n ## Weekly meeting of stakeholders \n Bitte achten Sie auf unser [Digitales Whiteboard](https://placekitten.com/g/200/300)!  \n\n  I think Ich schreibe hier einen Paragraph. \n First Line discussing *RS 8 - Radschnellverbindung*  Second Line. Lorem **Ipsum** __Lorem__ \n 1. Task \n 2. Task2",
    },
    {
      title: "Abstimmung Kreuzungspunkt 12",
      startAt: new Date("2023-02-14 10:00"),
      locationName: undefined,
      locationUrl: undefined,
      description: undefined,
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
  const seedContacts = [
    {
      name: "Sven",
      email: "sven@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
    },
    {
      name: "Tobias Jordans",
      email: "tobias@fixmycity.de",
      title: null,
      role: null,
      phone: null,
    },
    {
      name: "Johanna",
      email: "johanna@fixmycity.de",
      title: "Developer",
      role: "Member",
      phone: "030-123 123",
    },
  ]

  for (let i = 0; i < seedContacts.length; i++) {
    const data = seedContacts[i]
    if (data) {
      await db.contact.create({
        data,
      })
    }
  }
}

export default seed
