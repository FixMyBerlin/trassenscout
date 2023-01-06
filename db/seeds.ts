import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
  const user = await db.user.create({
    data: {
      email: "dev-team@fixmycity.de",
      // password: dev-team@fixmycity.de
      hashedPassword:
        "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    },
  })

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
}

export default seed
