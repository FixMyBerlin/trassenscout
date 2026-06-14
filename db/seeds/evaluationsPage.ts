import db, { EvaluationsPage } from "../index"

const seedEvaluationsPage = async () => {
  const seedData: Omit<EvaluationsPage, "updatedAt" | "updatedById">[] = [
    {
      id: 1,
      title: "Auswertungen",
      markdown: "Diese Seite wird in Kürze mit Auswertungen befüllt.",
    },
  ]

  for (const data of seedData) {
    await db.evaluationsPage.create({ data })
  }
}

export default seedEvaluationsPage
