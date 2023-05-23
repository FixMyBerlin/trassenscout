import db, { Stakeholdernote } from "../index"

const seedStakeholdernotes = async () => {
  const stakeholdernotes: Omit<Stakeholdernote, "id" | "createdAt" | "updatedAt">[] = [
    {
      title: "Kita Klein und Stark",
      status: "IN_PROGRESS",
      statusText: null,
      subsectionId: 2,
    },
    {
      title: "ADFC Süd",
      status: "DONE",
      statusText: null,
      subsectionId: 1,
    },
    {
      title: "Feuerwehr Schrankenhusenborstel",
      status: "PENDING",
      statusText: "Gspräch per Telefon vielversprechend",
      subsectionId: 1,
    },
    {
      title: "Kita Schrankenhusenborstel",
      status: "IN_PROGRESS",
      statusText:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
      subsectionId: 2,
    },
    {
      title: "ADFC Nord",
      status: "DONE",
      statusText:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
      subsectionId: 1,
    },
    {
      title: "Feuerwehr Schrankenhusenborstel",
      status: "IRRELEVANT",
      statusText: "Gspräch per Telefon vielversprechend",
      subsectionId: 1,
    },
  ]

  for (let i = 0; i < stakeholdernotes.length; i++) {
    const data = stakeholdernotes[i]
    if (data) {
      await db.stakeholdernote.create({ data })
    }
  }
}

export default seedStakeholdernotes
