import db from "@/src/server/db.server"

const seedEvaluationsPage = async () => {
  await db.evaluationsPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      title: "Auswertungen",
      markdown: "Diese Seite wird in Kürze mit Auswertungen befüllt.",
    },
    update: {},
  })
}

export default seedEvaluationsPage
