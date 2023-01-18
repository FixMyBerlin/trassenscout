import db, { Stakeholdernote } from "../index"

const seedStakeholdernotes = async () => {
  const stakeholdernotes: Omit<Stakeholdernote, "id" | "createdAt" | "updatedAt">[] = [
    {
      name: "Kita Klein und Stark",
      status: "inprogress",
      statusText: null,
    },
    {
      name: "ADFC Süd",
      status: "done",
      statusText: null,
    },
    {
      name: "Feuerwehr Schrankenhusenborstel",
      status: "pending",
      statusText: "Gspräch per Telefon vielversprechend",
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
