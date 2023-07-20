import db, { Prisma } from "../index"

const seedSurveys = async () => {
  const seedData: Prisma.SurveyUncheckedCreateInput[] = [
    {
      projectId: 1,
      slug: "rs23-1",
      title: "RS23 Beteiligung 1",
    },
    {
      projectId: 1,
      slug: "rs23-2",
      title: "RS23 Beteiligung 2",
      active: true,
    },
    {
      projectId: 2,
      slug: "rs3000",
      title: "RS3000 Beteiligung",
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
