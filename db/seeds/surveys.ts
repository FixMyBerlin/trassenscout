import db, { Prisma } from "../index"

const seedSurveys = async () => {
  const seedData: Prisma.SurveyUncheckedCreateInput[] = [
    {
      projectId: 1,
      slug: "rs23-1",
      title: "RS23 Beteiligung 1 (inaktiv)",
      active: false,
    },
    {
      projectId: 1,
      slug: "rs23-inaktiv",
      title: "RS23 Beteiliung 2 (aktiv)",
      active: true,
    },
    {
      projectId: 2,
      slug: "ris3000",
      title: "Projekt Mit Einer Umfrage (Redirect)",
      active: false,
    },
  ]

  for (let i = 0; i < seedData.length; i++) {
    const data = seedData[i]
    if (data) {
      await db.survey.create({ data })
    }
  }
}

export default seedSurveys
