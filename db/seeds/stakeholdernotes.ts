import db, { Stakeholdernote } from "../index"

const stakeholdernotes = async () => {
  const seedStakeholdernotes: Omit<Stakeholdernote, "id" | "createdAt" | "updatedAt">[] = [
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

  for (let i = 0; i < seedStakeholdernotes.length; i++) {
    const data = seedStakeholdernotes[i]
    if (data) {
      await db.stakeholdernote.create({ data })
    }
  }
}

export default stakeholdernotes
